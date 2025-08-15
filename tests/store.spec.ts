import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { getMaterialSlotId } from '../src/lib/materials'
import { useCharacterStore } from '../src/state/useCharacterStore'
import { mockAsset } from './helpers'

describe('character store', () => {
  it('sets material assignment entries', () => {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial())
    const key = getMaterialSlotId(mesh, 0)
    const set = useCharacterStore.getState().setMaterialAssign
    set(key, 'head')
    const val = useCharacterStore.getState().materialAssign[key]
    expect(val).toBe('head')
  })

  it('refreshMorphKeys updates state immutably', () => {
    useCharacterStore.setState({ morphKeys: ['A'], morphWeights: { A: 0 } })
    const geom = new THREE.BufferGeometry() as THREE.BufferGeometry & {
      morphTargetsDictionary?: Record<string, number>
    }
    geom.morphTargetsDictionary = { A: 0, B: 1 }
    useCharacterStore.getState().refreshMorphKeys(mockAsset({ geometry: geom }))
    const { morphKeys, morphWeights } = useCharacterStore.getState()
    expect(morphKeys).toEqual(['A', 'B'])
    expect(morphWeights).toEqual({ A: 0, B: 0 })
  })

  it('persists only lightweight fields', () => {
    localStorage.clear()
    useCharacterStore.setState({
      materialAssign: { foo: 'head' },
      boneMap: { a: 'b' },
      headOffset: { position: { x: 1, y: 2, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: 1 },
      base: mockAsset(),
    })
    const raw = localStorage.getItem('char-morphs')!
    const stored = JSON.parse(raw).state
    expect(stored).toHaveProperty('materialAssign')
    expect(stored).toHaveProperty('boneMap')
    expect(stored).toHaveProperty('headOffset')
    expect(stored).not.toHaveProperty('base')
  })
})
