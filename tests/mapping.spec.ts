import { describe, it, expect } from 'vitest'
import { useCharacterStore } from '../src/state/useCharacterStore'

describe('bone map persistence', () => {
  it('stores overrides', () => {
    const set = useCharacterStore.getState().setBoneMap
    set('J_Head','head')
    expect(useCharacterStore.getState().boneMap['J_Head']).toBe('head')
  })
})
