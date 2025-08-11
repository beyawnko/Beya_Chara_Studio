import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useThree: () => ({ gl: { info: { memory: { geometries: 1, textures: 2 } } } }),
}))

vi.mock('../src/state/useCharacterStore', () => {
  const state = {
    base: null,
    head: null,
    body: null,
    activePart: 'base',
    morphWeights: {} as Record<string, number>,
    morphKeys: [] as string[],
    materialAssign: {} as Record<string, 'head'|'body'|'none'>,
  }
  return {
    useCharacterStore: (sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state),
  }
})

import { Viewport } from '../src/components/Viewport'

describe('PerfHUD overlay', () => {
  it('renders in development mode', () => {
    vi.stubEnv('DEV', 'true')
    const html = renderToStaticMarkup(<Viewport />)
    expect(html).toContain('Geometries')
    vi.unstubAllEnvs()
  })
})

