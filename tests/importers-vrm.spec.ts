import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

import { loadAny } from '../src/lib/importers'

const __dirname = dirname(fileURLToPath(import.meta.url))

function fileFromPath(p: string, name: string) {
  const buf = readFileSync(resolve(__dirname, p))
  return new File([buf], name)
}

describe('VRM loader', () => {
  it.skip('loads and orients VRM model', async () => {
    const asset = await loadAny(fileFromPath('assets/VRM1.vrm', 'VRM1.vrm'))
    expect(asset.vrm).toBeTruthy()
    expect(asset.vrm?.meta?.specVersion?.startsWith('1')).toBe(true)
    expect(Math.abs(asset.vrm?.scene.rotation.y ?? 0)).toBeLessThan(1e-5)
  }, 20000)
})
