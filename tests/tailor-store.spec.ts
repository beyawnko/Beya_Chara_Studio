import { describe, expect, it } from 'vitest'

import { useTailorStore } from '../src/state/useTailorStore'

describe('tailor store', () => {
  it('adds pins immutably', () => {
    useTailorStore.setState({ pins: [] })
    useTailorStore.getState().addPin({ vertex: 1, type: 'fixed', target: [0, 0, 0] })
    expect(useTailorStore.getState().pins).toHaveLength(1)
  })

  it('toggles mode', () => {
    useTailorStore.setState({ mode: 'character' })
    useTailorStore.getState().setMode('tailor')
    expect(useTailorStore.getState().mode).toBe('tailor')
  })
})
