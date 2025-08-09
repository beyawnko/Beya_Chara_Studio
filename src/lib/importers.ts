import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { GLTF,GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import type { LoadedFBX } from '../types'
import { extractVRMPresetsFromGLTF } from './vrm'

export type AnyAsset = LoadedFBX & { vrmPresets?: string[] }

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
      const base = opts.asVariantOf.geometry
      if ((base.getAttribute('position').count !== geo.getAttribute('position').count) ||
          ((base.getIndex()?.count ?? 0) !== (geo.getIndex()?.count ?? 0))) {
        throw new Error('Topology mismatch vs base')
      }
    }
    return out
  }

  if (ext === 'glb' || ext === 'gltf' || ext === 'vrm') {
    const loader = new GLTFLoader()
    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.parse(ab, '/', resolve, reject)
    })
    const root = gltf.scene
    const sk = firstSkinned(root)
    if (!sk) throw new Error('No SkinnedMesh found in GLTF/VRM')

    const { skinned, geo } = sanitizeSkinned(sk)
    const out: AnyAsset = {
      name, mesh: skinned, geometry: geo, skeleton: skinned.skeleton, bindMatrix: skinned.bindMatrix.clone()
    }

    // VRM preset extraction (VRM 0.x "VRM" or 1.0 "VRMC_vrm")
    try {
      const presets = extractVRMPresetsFromGLTF(gltf)
      if (presets?.length) (out as AnyAsset).vrmPresets = presets
    } catch {
      // ignore errors, not all GLTFs are VRMs
    }

    if (opts.asVariantOf) {
      const base = opts.asVariantOf.geometry
      if ((base.getAttribute('position').count !== geo.getAttribute('position').count) ||
          ((base.getIndex()?.count ?? 0) !== (geo.getIndex()?.count ?? 0))) {
        throw new Error('Topology mismatch vs base')
      }
    }
    return out
  }

  throw new Error('Unsupported file type: ' + ext)
}
