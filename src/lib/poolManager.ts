import { createPool } from './pool'

export function createPoolManager(workerUrl: URL) {
  let pool: ReturnType<typeof createPool> | null = null

  return {
    getPool: () => {
      if (!pool) pool = createPool(workerUrl)
      const { run } = pool
      return { run }
    },
    disposePool: () => {
      if (pool) {
        pool.dispose()
        pool = null
      }
    }
  }
}
