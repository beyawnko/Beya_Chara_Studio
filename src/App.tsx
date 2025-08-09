import React from 'react'
import { Viewport } from './components/Viewport'
import { FileDrop } from './components/FileDrop'
import { ExportPanel } from './components/ExportPanel'
import { ConflictPanel } from './components/ConflictPanel'
import { PartTabs } from './components/PartTabs'
import { ARKitPanel } from './components/ARKitPanel'
import { MaterialSplitPanel } from './components/MaterialSplitPanel'
import { SkeletonBadge } from './components/SkeletonBadge'
import { RetargetPanel } from './components/RetargetPanel'
import { BoneMapEditor } from './components/BoneMapEditor'
import { useCharacterStore } from './state/useCharacterStore'

export default function App() {
  const base = useCharacterStore(s => s.base)
  const variants = useCharacterStore(s => s.variants)
  const activePart = useCharacterStore(s => s.activePart)

  return (
    <div className="row">
      <div className="sidebar">
        <h3>Character Morph Creator (GLB-only)</h3>
        <PartTabs />
        <FileDrop kind={activePart==='head' ? 'headBase' : activePart==='body' ? 'bodyBase' : 'base'} />
        <div style={{height:8}} />
        <FileDrop kind={activePart==='head' ? 'headVariant' : activePart==='body' ? 'bodyVariant' : 'variant'} />

        <div style={{height:12}} />
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
      </div>
      <div className="main">
        <Viewport />
      </div>
    </div>
  )
}
