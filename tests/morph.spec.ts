import * as THREE from 'three'
import { describe, expect,it } from 'vitest'

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
    // @ts-expect-error Property 'morphTargetsDictionary' does not exist on type 'BufferGeometry'.
    expect(geo.morphTargetsDictionary['Test']).toBe(0)
  })
})
