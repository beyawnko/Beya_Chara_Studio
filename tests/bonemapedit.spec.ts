import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { rebindHeadToBody } from '../src/lib/retarget'

function mockFBX(names: string[]): any {
  const bones = names.map(n => { const b = new THREE.Bone(); b.name = n; return b })
  return {
    mesh: new THREE.SkinnedMesh(new THREE.BufferGeometry(), []),
    geometry: new THREE.BufferGeometry().setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(4), 4)).setAttribute('skinWeight', new THREE.BufferAttribute(new Float32Array(4), 4)),
    skeleton: new THREE.Skeleton(bones)
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
