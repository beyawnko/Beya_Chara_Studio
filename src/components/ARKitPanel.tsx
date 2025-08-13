import React, { useMemo, useState } from 'react'

import { ARKIT_52, generateARKitSetFromVRM, GeneratedShape } from '../lib/arkit'
import { synthesizeARKitMorphs } from '../lib/arkitSynthesis'
import { useCharacterStore } from '../state/useCharacterStore'

export function ARKitPanel() {
  const base = useCharacterStore(s => s.base)
  const head = useCharacterStore(s => s.head)
  const active = useCharacterStore(s => s.activePart)
  const asset = active==='head' ? head : base
  const [generated, setGenerated] = useState<GeneratedShape[]|null>(null)

  const vrmPresets = asset?.vrmPresets

  const coverage = useMemo(()=>{
    const morphKeys = useCharacterStore.getState().morphKeys
    const set = new Set(morphKeys.map(k=>k.toLowerCase()))
    const present:string[] = []
    const missing:string[] = []
    for (const n of ARKIT_52) {
      if (set.has(n.toLowerCase())) present.push(n)
      else missing.push(n)
    }
    return {present, missing}
  }, [asset])

  const canGen = !!vrmPresets && vrmPresets.length>0

  return (
    <div>
      <h4>ARKit Coverage</h4>
      {!asset && <small>Upload a head mesh to check coverage.</small>}
      {asset && (
        <div>
          <div><span className="badge">Present</span>{coverage.present.length}/52</div>
          {coverage.missing.length>0 && <details><summary>Missing ({coverage.missing.length})</summary>
            <small>{coverage.missing.join(', ')}</small>
          </details>}

          <div style={{marginTop:8}}>
            <button className="btn" onClick={()=>{
              synthesizeARKitMorphs(asset!)
              useCharacterStore.getState().refreshMorphKeys(asset!)
            }}>Generate ARKit Morph Targets (procedural subset)</button>
          </div>

          {canGen && (
            <div style={{marginTop:8}}>
              <button className="btn" onClick={()=>{
                const mapped = generateARKitSetFromVRM(vrmPresets!)
                setGenerated(mapped)
              }}>Analyze VRM presets → ARKit (report)</button>
              {generated && <div><small>Generated {generated.length} shape reports (VRM/SYNTH). Use the button above to actually add morph targets.</small></div>}
            </div>
          )}
          {!canGen && <small>No VRM presets detected. If this is a VRM, ensure it includes expressions.</small>}
        </div>
      )}
    </div>
  )
}
