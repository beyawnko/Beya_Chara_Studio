import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import type { AnyAsset, LoadedFBX } from '../types'
import { extractVRMPresetsFromGLTF } from './vrm'

export function validateTopology(base: THREE.BufferGeometry, geo: THREE.BufferGeometry) {
  const posA = base.getAttribute('position').count, posB = geo.getAttribute('position').count;
  if (posA !== posB) throw new Error(`Topology mismatch: vertex count ${posA} vs ${posB}`);
  const idxA = base.getIndex()?.count ?? 0, idxB = geo.getIndex()?.count ?? 0;
  if (idxA !== idxB) throw new Error(`Topology mismatch: index count ${idxA} vs ${idxB}`);
}

function sanitizeSkinned(skinned: THREE.SkinnedMesh) {
  const geo = skinned.geometry.clone()
  if (!geo.getAttribute('position')) throw new Error('Missing positions')
  if (!geo.getAttribute('normal')) geo.computeVertexNormals()
  if (!geo.getAttribute('skinIndex') || !geo.getAttribute('skinWeight'))
    throw new Error('Missing skin attributes')
  skinned.updateMatrixWorld(true)
  // avoid baking world transform for skinned meshes
  skinned.position.set(0,0,0); skinned.rotation.set(0,0,0); skinned.scale.set(1,1,1)
  return { skinned, geo }
}

function firstSkinned(root: THREE.Object3D): THREE.SkinnedMesh | null {
  let target: THREE.SkinnedMesh | null = null
  root.traverse((o: THREE.Object3D)=>{
    if (o instanceof THREE.SkinnedMesh && !target) target = o
  })
  return target
}

export async function loadAny(file: File, opts: { asVariantOf?: LoadedFBX } = {}): Promise<AnyAsset> {
  const name = file.name.replace(/\.[^.]+$/, '')
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext) throw new Error('File has no extension')
  const ab = await file.arrayBuffer()

  if (ext === 'fbx') {
    const fbx = new FBXLoader().parse(ab, '/')
    const sk = firstSkinned(fbx)
    if (!sk) throw new Error('No SkinnedMesh found')
    const { skinned, geo } = sanitizeSkinned(sk)
    const out: AnyAsset = {
      name, mesh: skinned, geometry: geo, skeleton: skinned.skeleton, bindMatrix: skinned.bindMatrix.clone()
    }
    if (opts.asVariantOf) {
      validateTopology(opts.asVariantOf.geometry, geo)
    }
    return out
  }

  if (ext === 'glb' || ext === 'gltf' || ext === 'vrm') {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))
    const gltf = await loader.parseAsync(ab, '/')
    const vrm = gltf.userData?.vrm
    if (vrm) VRMUtils.rotateVRM0(vrm)
    const root = gltf.scene
    const sk = firstSkinned(root)
    if (!sk) throw new Error('No SkinnedMesh found in GLTF/VRM')

    const { skinned, geo } = sanitizeSkinned(sk)
    const out: AnyAsset = {
      name,
      mesh: skinned,
      geometry: geo,
      skeleton: skinned.skeleton,
      bindMatrix: skinned.bindMatrix.clone(),
      vrm,
    }

    // VRM preset extraction (VRM 0.x "VRM" or 1.0 "VRMC_vrm")
    try {
      const presets = extractVRMPresetsFromGLTF(gltf)
      if (presets?.length) out.vrmPresets = presets
    } catch {
      // ignore errors, not all GLTFs are VRMs
    }

    if (opts.asVariantOf) {
      validateTopology(opts.asVariantOf.geometry, geo)
    }
    return out
  }

  throw new Error('Unsupported file type: ' + ext)
}
