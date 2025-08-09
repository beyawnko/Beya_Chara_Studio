import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { attachMorph } from '../src/lib/morphs'

describe('morph attachment', () => {
  it('attaches relative morph attributes', () => {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array([0,0,0, 1,0,0, 0,1,0])
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const d = new Float32Array(pos.length)
    d[0]=0.1; d[4]=0.2; d[8]=0.3
    attachMorph(geo, 'Test', d)
    expect(geo.morphAttributes.position?.length).toBe(1)
    expect(geo.morphTargetsRelative).toBe(true)
    // index mapping
    // @ts-ignore
    expect(geo.morphTargetsDictionary['Test']).toBe(0)
  })
})
