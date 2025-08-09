import React, { useMemo, useState } from 'react'
import * as THREE from 'three'

import { exportGLB, exportGLBBufferCombined } from '../lib/exportGLB'
import { getMorphMeta } from '../lib/morphs'
import { useCharacterStore } from '../state/useCharacterStore'

export function ExportPanel() {
  const base = useCharacterStore(s => s.base)
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const active = useCharacterStore(s => s.activePart)
  const assign = useCharacterStore(s => s.materialAssign)

  const asset = active==='head' ? head : active==='body' ? body : base
  const can = !!asset?.mesh

  const allowSet = useMemo(()=>{
    if (!asset?.mesh) return undefined
    const matArr = Array.isArray(asset.mesh.material) ? asset.mesh.material : [asset.mesh.material]
    const allow = new Set<number>()
    matArr.forEach((m: THREE.Material, i:number) => {
      const key = `${m?.name || 'mat'}#${i}`
      const val = assign[key] || 'none'
      if (active==='head' && val==='head') allow.add(i)
      if (active==='body' && val==='body') allow.add(i)
      if (active==='base') allow.add(i) // full body exports all
    })
    return allow
  }, [asset, assign, active])

  const exportCombined = async () => {
    if (!base && !(head && body)) return
    const headAllow = new Set<number>(), bodyAllow = new Set<number>()
    if (head?.mesh) {
      const arr = Array.isArray(head.mesh.material) ? head.mesh.material : [head.mesh.material]
      arr.forEach((m: THREE.Material,i:number)=>{
        const key = `${m?.name || 'mat'}#${i}`
        const val = assign[key] || 'none'
        if (val==='head') headAllow.add(i)
      })
    }
    if (body?.mesh) {
      const arr = Array.isArray(body.mesh.material) ? body.mesh.material : [body.mesh.material]
      arr.forEach((m: THREE.Material,i:number)=>{
        const key = `${m?.name || 'mat'}#${i}`
        const val = assign[key] || 'none'
        if (val==='body') bodyAllow.add(i)
      })
    }
    const ab = await exportGLBBufferCombined(body ?? null, head ?? null, { bodyAllow, headAllow })
    const blob = new Blob([ab], { type: 'model/gltf-binary' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Character_UE_Combined.glb'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {active==='base' && (head && body) ? (
        <button className="btn" onClick={exportCombined}>Export GLB for UE (Combined Head+Body)</button>
      ) : (
        <button className="btn" disabled={!can} onClick={() => asset && exportGLB(asset, { materialAllow: allowSet })}>
          Export GLB for UE ({active})
        </button>
      )}
      {!can && <div><small>Upload a base for the selected part.</small></div>}
      <hr/>
      <MorphSliders />
    </div>
  )
}

function MorphSliders() {
  const base = useCharacterStore(s => s.base)
  const morphKeys = useCharacterStore(s => s.morphKeys)
  const weights = useCharacterStore(s => s.morphWeights)
  const setWeight = useCharacterStore(s => s.setMorphWeight)
  const [showDuplicates, setShowDuplicates] = useState(false)

  const grouped = useMemo(() => {
    if (!base) return {}
    const meta = getMorphMeta(base.geometry)
    const groups: Record<string, {key:string, dup?:string|null}[]> = {}
    for (const k of morphKeys) {
      const m = meta[k] || { category: 'Other', duplicateOf: null }
      if (!showDuplicates && m.duplicateOf) continue
      const g = m.category || 'Other'
      groups[g] ??= []
      groups[g].push({ key: k, dup: m.duplicateOf })
    }
    return groups
  }, [base, morphKeys, showDuplicates])

  return (
    <div>
      <h4>Morphs</h4>
      <label style={{display:'block', marginBottom:6}}>
        <input type="checkbox" checked={showDuplicates} onChange={e=>setShowDuplicates(e.target.checked)} /> Show duplicates
      </label>
      {Object.keys(grouped).length === 0 && <small>No morphs yet.</small>}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{marginBottom:8}}>
          <strong>{cat}</strong>
          {items.map(({key, dup}) => (
            <div key={key}>
              <label>{key}{dup ? <small> (dupe of {dup})</small> : null}</label>
              <input type="range" min={0} max={1} step={0.01}
                value={weights[key] ?? 0}
                onChange={(e)=> setWeight(key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
