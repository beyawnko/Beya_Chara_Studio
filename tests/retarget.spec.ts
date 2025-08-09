import * as THREE from 'three'
import { describe, expect,it } from 'vitest'

import { suggestBoneMap } from '../src/lib/retarget'

function skel(names: string[]) {
  const bones = names.map(n => { const b = new THREE.Bone(); b.name = n; return b })
  return new THREE.Skeleton(bones)
}

describe('suggestBoneMap', () => {
  it('maps identical names directly', () => {
    const s = skel(['head','neck_01','jaw'])
    const d = skel(['head','neck_01','jaw'])
    const map = suggestBoneMap(s, d)
    expect(map['head']).toBe('head')
    expect(map['jaw']).toBe('jaw')
  })
})
