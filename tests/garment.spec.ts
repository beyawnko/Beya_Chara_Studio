import { describe, expect, it, vi } from 'vitest'

import { useCharacterStore } from '../src/state/useCharacterStore'
import type { AnyAsset } from '../src/types'

vi.mock('../src/lib/importers', () => ({
  loadAny: vi.fn(async () => ({ name: 'garment', geometry: {} } as AnyAsset))
}))

describe('garment import', () => {
  it('stores garment asset', async () => {
    useCharacterStore.setState({ garment: null, errors: [] })
    const file = new File([''], 'garment.glb')
    await useCharacterStore.getState().onGarmentFiles([file])
    const state = useCharacterStore.getState()
    expect(state.garment?.name).toBe('garment')
    expect(state.errors).toHaveLength(0)
  })
})
