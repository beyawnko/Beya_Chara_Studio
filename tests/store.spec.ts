import { describe, expect,it } from 'vitest'

import { useCharacterStore } from '../src/state/useCharacterStore'

describe('material assignment store', () => {
  it('sets material assignment entries', () => {
    const set = useCharacterStore.getState().setMaterialAssign
    set('mat#0','head')
    const val = useCharacterStore.getState().materialAssign['mat#0']
    expect(val).toBe('head')
  })
})
