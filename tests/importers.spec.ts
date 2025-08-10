import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { validateTopology } from '../src/lib/importers'

describe('validateTopology', () => {
  it('allows matching position and index counts', () => {
    const base = new THREE.BufferGeometry()
    const variant = new THREE.BufferGeometry()
    const posA = new Float32Array(9)
    const posB = new Float32Array(9)
    base.setAttribute('position', new THREE.BufferAttribute(posA, 3))
    variant.setAttribute('position', new THREE.BufferAttribute(posB, 3))
    const idx = new THREE.BufferAttribute(new Uint16Array([0,1,2]), 1)
    base.setIndex(idx)
    variant.setIndex(idx)
    expect(() => validateTopology(base, variant)).not.toThrow()
  })

  it('throws when vertex counts differ', () => {
    const base = new THREE.BufferGeometry()
    const variant = new THREE.BufferGeometry()
    base.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3))
    variant.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    expect(() => validateTopology(base, variant)).toThrow()
  })

  it('throws when index counts differ', () => {
    const base = new THREE.BufferGeometry()
    const variant = new THREE.BufferGeometry()
    const pos = new Float32Array(9)
    base.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    variant.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    base.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2]), 1))
    expect(() => validateTopology(base, variant)).toThrow()
  })
})
