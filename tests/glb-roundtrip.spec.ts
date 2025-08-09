import * as THREE from 'three'
import { GLTF,GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { describe, expect,it } from 'vitest'

import { exportGLBBuffer } from '../src/lib/exportGLB'
import { LoadedFBX } from '../src/types'

// Build a minimal "LoadedFBX" compatible object in-memory
function buildAsset(): LoadedFBX {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array([0,0,0, 1,0,0, 0,1,0, 0,0,1])
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  // trivial skin (all to bone 0)
  const skinIndex = new Float32Array([0,0,0, 0,0,0, 0,0,0, 0,0,0])
  const skinWeight = new Float32Array([1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0])
  geo.setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(skinIndex), 4))
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(skinWeight), 4))

  // add a tiny morph
  const d = new Float32Array(pos.length)
  d[1] = 0.1
  geo.morphAttributes.position = [ new THREE.BufferAttribute(d, 3) ]
  geo.morphTargetsDictionary = { Test: 0 }
  geo.morphTargetsRelative = true

  const bone = new THREE.Bone()
  bone.name = 'test_bone'
  const skel = new THREE.Skeleton([bone])
  const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshStandardMaterial())
  mesh.add(bone)
  mesh.bind(skel)

  return { name:'Test', mesh, geometry: geo, skeleton: skel, bindMatrix: new THREE.Matrix4() }
}

describe('GLB round-trip', () => {
  // Previously failed due to GLTFExporter cloning the skeleton incorrectly.
  // Using SkeletonUtils.clone ensures the bones are included so the loader can
  // restore the skin and morph targets.
  it('exports skin + morphs and re-imports with them intact', async () => {
    const asset = buildAsset()
    const ab = await exportGLBBuffer(asset)
    const gltf = await new Promise<GLTF>((res, rej) => {
      const loader = new GLTFLoader()
      loader.parse(ab, '/', res, rej)
    })
    let skinned: THREE.SkinnedMesh | null = null
    gltf.scene.traverse((o: THREE.Object3D)=>{ if (o instanceof THREE.SkinnedMesh) skinned = o })
    expect(skinned).toBeTruthy()
    const g = skinned!.geometry as THREE.BufferGeometry

    // geometry is preserved
    const inPos = asset.geometry.getAttribute('position') as THREE.BufferAttribute
    const outPos = g.getAttribute('position') as THREE.BufferAttribute
    expect(outPos.count).toBe(inPos.count)

    // morph target round-trips
    expect(g.morphAttributes?.position?.length || 0).toBe(1)
    const inMorph = asset.geometry.morphAttributes.position![0] as THREE.BufferAttribute
    const outMorph = g.morphAttributes.position![0]
    expect(Array.from(outMorph.array)).toEqual(Array.from(inMorph.array))
  })
})
