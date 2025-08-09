import React, { useMemo } from 'react'
import { useCharacterStore } from '../state/useCharacterStore'
import { getPresetMap, PRESET_MAPS } from '../lib/retargetPresets'

export function BoneMapEditor() {
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const map = useCharacterStore(s => s.boneMap)
  const setMap = useCharacterStore(s => s.setBoneMap)
  const setSel = useCharacterStore(s => s.setSelectedBones)

  if (!head || !body) return null

  const src = head.skeleton.bones.map(b=>b.name)
  const dst = body.skeleton.bones.map(b=>b.name)

  function applyPreset(key: keyof typeof PRESET_MAPS) {
    const preset = getPresetMap(key as any)
    for (const [s, d] of Object.entries(preset)) {
      setMap(s, d)
    }
  }

  return (
    <div>
      <h4>Bone Map Editor</h4>
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:6}}>
        <button className="btn" onClick={()=>applyPreset('VRM_to_UE5')}>VRoid/VRM → UE5</button>
        <button className="btn" onClick={()=>applyPreset('VRM_to_Mixamo')}>VRoid/VRM → Mixamo</button>
        <button className="btn" onClick={()=>applyPreset('VRM_to_MMD')}>VRoid/VRM → MMD</button>
      </div>
      <small>Click a source bone to highlight; selecting a target highlights it on the body.</small>
      <div style={{maxHeight: 180, overflow:'auto', border:'1px solid #333', borderRadius:6, padding:6}}>
        <table style={{width:'100%', fontSize:12}}>
          <thead><tr><th align="left">Source (Head)</th><th align="left">→ Target (Body)</th></tr></thead>
          <tbody>
            {src.map(s => (
              <tr key={s}>
                <td>
                  <button className="btn" onClick={()=> setSel(s, undefined)}>{s}</button>
                </td>
                <td>
                  <select value={map[s] ?? ''} onChange={e=> { setMap(s, e.target.value); setSel(undefined, e.target.value) }}>
                    <option value="">(auto / neck fallback)</option>
                    {dst.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
