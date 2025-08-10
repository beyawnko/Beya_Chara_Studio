import { it, expect, vi } from 'vitest'

const runMock = vi.fn()

vi.mock('comlink', () => ({
  wrap: () => ({ diffMorph: runMock })
}))

it('createPool works without navigator', async () => {
  runMock.mockResolvedValue({})

  const originalNavigator = globalThis.navigator
  Object.defineProperty(globalThis, 'navigator', {
    value: undefined,
    configurable: true,
    writable: true
  })

  const workerInstances: URL[] = []
  class MockWorker {
    constructor(_url: URL) {
      workerInstances.push(_url)
    }
    terminate() {}
  }
  const originalWorker = globalThis.Worker
  ;(globalThis as any).Worker = MockWorker as any

  const { createPool } = await import('../src/lib/pool')
  const pool = createPool(new URL('https://example.com/worker.js'))
  expect(workerInstances.length).toBe(3)
  await pool.run('diffMorph', { basePos: new Float32Array(), varPos: new Float32Array() })
  expect(runMock).toHaveBeenCalled()
  pool.dispose()

  Object.defineProperty(globalThis, 'navigator', {
    value: originalNavigator,
    configurable: true,
    writable: true
  })
  ;(globalThis as any).Worker = originalWorker
  vi.resetModules()
})

it('createPool uses default worker count', async () => {
  runMock.mockClear()
  runMock.mockResolvedValue({})

  const workerInstances: URL[] = []
  class MockWorker {
    constructor(url: URL) {
      workerInstances.push(url)
    }
    terminate() {}
  }
  vi.stubGlobal('Worker', MockWorker as any)
  vi.stubGlobal('navigator', {})

  const { createPool } = await import('../src/lib/pool')
  const pool = createPool(new URL('https://example.com/worker.js'))
  expect(workerInstances.length).toBe(3)
  await pool.run('diffMorph', { basePos: new Float32Array(), varPos: new Float32Array() })
  expect(runMock).toHaveBeenCalled()
  pool.dispose()

  vi.unstubAllGlobals()
  vi.resetModules()
})
