import { describe, expect, it, vi } from 'vitest'

import { useCharacterStore } from '../src/state/useCharacterStore'
import { useTailorStore } from '../src/state/useTailorStore'
import type { AnyAsset } from '../src/types'

let resolveLoad: (asset: AnyAsset) => void
vi.mock('../src/lib/importers', () => ({
  loadAny: vi.fn(() => new Promise<AnyAsset>(r => { resolveLoad = r }))
}))

describe('garment import', () => {
  it('stores garment asset', async () => {
    useCharacterStore.setState({ garment: null, errors: [], isLoading: false })
    useTailorStore.setState({ pins: [{ vertex: 1, type: 'fixed', target: [0,0,0] }], isSimulating: true })
    const file = new File([''], 'garment.glb')
    const p = useCharacterStore.getState().onFiles('garment', [file])
    expect(useCharacterStore.getState().isLoading).toBe(true)
    resolveLoad({ name: 'garment', geometry: {} } as AnyAsset)
    await p
    const state = useCharacterStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.garment?.name).toBe('garment')
    expect(state.errors).toHaveLength(0)
    const tState = useTailorStore.getState()
    expect(tState.pins).toHaveLength(0)
    expect(tState.isSimulating).toBe(false)
  })
})
