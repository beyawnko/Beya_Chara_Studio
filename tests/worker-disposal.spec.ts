import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('disposes morph workers', async () => {
  const dispose = vi.fn()
  vi.doMock('../src/lib/pool', () => ({ createPool: () => ({ run: vi.fn(), dispose }) }))
  const { morphPool, disposeMorphPool } = await import('../src/lib/morphs')
  morphPool()
  disposeMorphPool()
  expect(dispose).toHaveBeenCalled()
})

it('disposes retarget workers', async () => {
  const dispose = vi.fn()
  vi.doMock('../src/lib/pool', () => ({ createPool: () => ({ run: vi.fn(), dispose }) }))
  const { retargetPool, disposeRetargetPool } = await import('../src/lib/retarget')
  retargetPool()
  disposeRetargetPool()
  expect(dispose).toHaveBeenCalled()
})
