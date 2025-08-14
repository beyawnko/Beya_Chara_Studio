import { kindMap } from '../lib/kindMap'
import { useCharacterStore } from '../state/useCharacterStore'
import { useTailorStore } from '../state/useTailorStore'
import { ARKitPanel } from './ARKitPanel'
import { BoneMapEditor } from './BoneMapEditor'
import { ConflictPanel } from './ConflictPanel'
import { ExportPanel } from './ExportPanel'
import { FileDrop } from './FileDrop'
import { MaterialSplitPanel } from './MaterialSplitPanel'
import { PartTabs } from './PartTabs'
import { RetargetPanel } from './RetargetPanel'
import { SkeletonBadge } from './SkeletonBadge'

export function CharacterModeSidebar() {
  const base = useCharacterStore(s => s.base)
  const variants = useCharacterStore(s => s.variants)
  const activePart = useCharacterStore(s => s.activePart)
  const { base: baseKind, variant: variantKind } = kindMap[activePart]
  const setMode = useTailorStore(s => s.setMode)

  return (
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
}
