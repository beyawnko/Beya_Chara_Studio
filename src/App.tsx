import { useEffect } from 'react'

import { ARKitPanel } from './components/ARKitPanel'
import { BoneMapEditor } from './components/BoneMapEditor'
import { ConflictPanel } from './components/ConflictPanel'
import { DigitalTailorPanel } from './components/DigitalTailorPanel'
import { ExportPanel } from './components/ExportPanel'
import { FileDrop } from './components/FileDrop'
import { MaterialSplitPanel } from './components/MaterialSplitPanel'
import { PartTabs } from './components/PartTabs'
import { RetargetPanel } from './components/RetargetPanel'
import { SkeletonBadge } from './components/SkeletonBadge'
import { Viewport } from './components/Viewport'
import { disposeMorphPool } from './lib/morphs'
import { disposeRetargetPool } from './lib/retarget'
import { useCharacterStore } from './state/useCharacterStore'
import { useTailorStore } from './state/useTailorStore'

const kindMap = {
  base: { base: 'base', variant: 'variant' },
  head: { base: 'headBase', variant: 'headVariant' },
  body: { base: 'bodyBase', variant: 'bodyVariant' }
} as const

export default function App() {
  const base = useCharacterStore(s => s.base)
  const variants = useCharacterStore(s => s.variants)
  const activePart = useCharacterStore(s => s.activePart)
  const mode = useTailorStore(s => s.mode)
  const setMode = useTailorStore(s => s.setMode)

  const { base: baseKind, variant: variantKind } = kindMap[activePart]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cleanup = () => {
      disposeMorphPool()
      disposeRetargetPool()
    }
    window.addEventListener('beforeunload', cleanup)
    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  const sidebar = mode === 'tailor' ? (
    <>
      <button className="btn" onClick={() => setMode('character')}>Back to Character Mode</button>
      <DigitalTailorPanel />
    </>
  ) : (
    <>
      <h3>Character Morph Creator (GLB-only)</h3>
      <button className="btn" onClick={() => setMode('tailor')}>Enter Digital Tailor</button>
      <PartTabs />
      <FileDrop kind={baseKind} />
      <div className="spacer-sm" />
      <FileDrop kind={variantKind} />

      <div className="spacer-md" />
      <div>
        <div><span className="badge">Active</span>{activePart}</div>
        <div><span className="badge">Base</span>{base?.name ?? 'none'}</div>
        <div><span className="badge">Variants</span>{variants.length}</div>
      </div>

      <SkeletonBadge />
      <ConflictPanel />

      <hr />
      <MaterialSplitPanel />
      <hr />
      <RetargetPanel />
      <BoneMapEditor />
      <hr />
      <ExportPanel />
      <hr />
      <ARKitPanel />
    </>
  )

  return (
    <div className="row">
      <div className="sidebar">{sidebar}</div>
      <div className="main">
        <Viewport />
      </div>
    </div>
  )
}
