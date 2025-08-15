import { beforeAll, describe, expect, it, vi } from 'vitest'

import { initGarmentSubscriber } from '../src/state/subscriptions'
import { useCharacterStore } from '../src/state/useCharacterStore'
import { useTailorStore } from '../src/state/useTailorStore'
import type { AnyAsset } from '../src/types'

let resolveLoad: (asset: AnyAsset) => void
vi.mock('../src/lib/importers', () => ({
  loadAny: vi.fn(() => new Promise<AnyAsset>(r => { resolveLoad = r }))
}))
import { loadAny } from '../src/lib/importers'

describe('garment import', () => {
  beforeAll(() => {
    initGarmentSubscriber()
  })
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

  it('clears tailor state when garment removed', () => {
    useCharacterStore.setState({ garment: { name: 'g', geometry: {} } as AnyAsset })
    useTailorStore.setState({ pins: [{ vertex: 1, type: 'fixed', target: [0,0,0] }], isSimulating: true })
    useCharacterStore.setState({ garment: null })
    const tState = useTailorStore.getState()
    expect(tState.pins).toHaveLength(0)
    expect(tState.isSimulating).toBe(false)
  })

  it('ignores uploads while loading', async () => {
    useCharacterStore.setState({ isLoading: true, garment: null, errors: [] })
    vi.clearAllMocks()
    await useCharacterStore.getState().onFiles('garment', [new File([''], 'g.glb')])
    expect(loadAny).not.toHaveBeenCalled()
    expect(useCharacterStore.getState().garment).toBeNull()
  })
})
