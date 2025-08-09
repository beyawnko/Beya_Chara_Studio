import * as THREE from 'three'
import { describe, expect,it, vi } from 'vitest'

import { rebindHeadToBody } from '../src/lib/retarget'
import { LoadedFBX } from '../src/types'

vi.mock('../src/lib/pool', () => ({
  createPool: () => ({
    run: vi.fn().mockImplementation(async (name, args) => {
      if (name === 'remapSkinIndex') {
        return new Uint16Array(args.src.length)
      }
    }),
    dispose: vi.fn(),
  }),
}))

function mockFBX(names: string[]): LoadedFBX {
  const bones = names.map(n => { const b = new THREE.Bone(); b.name = n; return b })
  const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), [])
  mesh.bindMatrix = new THREE.Matrix4()
  return {
    name: 'mock',
    mesh: mesh,
    geometry: new THREE.BufferGeometry().setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(4), 4)).setAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(4), 4)),
    skeleton: new THREE.Skeleton(bones),
    bindMatrix: new THREE.Matrix4(),
  }
}

describe('Bone map override', () => {
  it('uses provided bone map', () => {
    const head = mockFBX(['head'])
    const body = mockFBX(['neck'])
    const map = { head: 'neck' }
    expect(() => rebindHeadToBody(head, body, map)).not.toThrow()
  })
})
