import React, { useMemo } from 'react'
import * as THREE from 'three'

import { useCharacterStore } from '../state/useCharacterStore'

type Assign = 'head'|'body'|'none'

export function MaterialSplitPanel() {
  const base = useCharacterStore(s => s.base)
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const active = useCharacterStore(s => s.activePart)
  const assign = useCharacterStore(s => s.materialAssign)
  const setAssign = useCharacterStore(s => s.setMaterialAssign)

  const mesh = active==='head' ? head?.mesh : active==='body' ? body?.mesh : base?.mesh

  const mats = useMemo(() => {
    if (!mesh) return []
    const m = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    return m.map((mat: THREE.Material, idx:number) => ({ index: idx, name: mat?.name || `mat_${idx}` }))
  }, [mesh])

  if (!mesh) return null

  return (
    <div>
      <h4>Material Split (Preview)</h4>
      <small>Assign materials to Head/Body/None for preview & per-part export.</small>
      <table style={{width:'100%', fontSize:12}}>
        <thead><tr><th align="left">Material</th><th>Head</th><th>Body</th><th>None</th></tr></thead>
        <tbody>
          {mats.map(({index,name}) => {
            const key = `${name}#${index}`
            const val:Assign = assign[key] ?? 'none'
            return (
              <tr key={key}>
                <td>{name}</td>
                <td><input type="radio" name={key} checked={val==='head'} onChange={()=>setAssign(key,'head')} /></td>
                <td><input type="radio" name={key} checked={val==='body'} onChange={()=>setAssign(key,'body')} /></td>
                <td><input type="radio" name={key} checked={val==='none'} onChange={()=>setAssign(key,'none')} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
