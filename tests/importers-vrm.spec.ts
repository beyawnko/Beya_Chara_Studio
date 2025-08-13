import { type VRM, VRMUtils } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { describe, expect, it, vi } from 'vitest'

import { loadAny } from '../src/lib/importers'

describe('VRM loader', () => {
  it('loads and orients VRM0 model', async () => {
    const vrmScene = new THREE.Group()
    vrmScene.rotation.y = Math.PI
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0], 3))
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([0], 1))
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute([1], 1))
    const bone = new THREE.Bone()
    const skeleton = new THREE.Skeleton([bone])
    const skinned = new THREE.SkinnedMesh(geo, new THREE.MeshBasicMaterial())
    skinned.add(bone)
    skinned.bind(skeleton)
    vrmScene.add(skinned)

    const vrm: VRM = { scene: vrmScene, meta: { specVersion: '0.0' } } as unknown as VRM
    const gltf: GLTF = { scene: vrmScene, userData: { vrm } } as unknown as GLTF

    const parseSpy = vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockResolvedValue(gltf)
    const rotateSpy = vi
      .spyOn(VRMUtils, 'rotateVRM0')
      .mockImplementation((v: VRM) => {
        v.scene.rotation.y -= Math.PI
      })

    const asset = await loadAny(new File([new ArrayBuffer(0)], 'test.vrm'))

    expect(parseSpy).toHaveBeenCalled()
    expect(rotateSpy).toHaveBeenCalledWith(vrm)
    expect(asset.vrm).toBe(vrm)
    expect(Math.abs(asset.vrm.scene.rotation.y)).toBeLessThan(1e-5)

    parseSpy.mockRestore()
    rotateSpy.mockRestore()
  })
})
