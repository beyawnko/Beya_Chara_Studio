import React, { useMemo, useState } from 'react'
import * as THREE from 'three'

import { alignHeadToBodyNeck, rebindHeadToBody,suggestBoneMap } from '../lib/retarget'
import { useCharacterStore } from '../state/useCharacterStore'

export function RetargetPanel() {
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const overrides = useCharacterStore(s => s.boneMap)
  const offset = useCharacterStore(s => s.headOffset)
  const setOffset = useCharacterStore(s => s.setHeadOffset)
  const [scale, setScale] = useState(offset.scale || 1.0)
  const [status, setStatus] = useState<string>('')

  const suggested = useMemo(()=>{
    if (!head || !body) return {}
    return suggestBoneMap(head.skeleton, body.skeleton)
  }, [head, body])

  const finalMap = useMemo(()=>({ ...suggested, ...overrides }), [suggested, overrides])
  const count = Object.keys(finalMap).length
  if (!head || !body) return null

  const presets = [
    { name:'+2cm Up', pos: new THREE.Vector3(0, 0.02, 0) },
    { name:'-2cm Down', pos: new THREE.Vector3(0, -0.02, 0) },
    { name:'+1cm Forward', pos: new THREE.Vector3(0, 0, 0.01) },
    { name:'-1cm Back', pos: new THREE.Vector3(0, 0, -0.01) },
    { name:'+5° Pitch Down', rot: new THREE.Euler(THREE.MathUtils.degToRad(5),0,0) },
    { name:'-5° Pitch Up', rot: new THREE.Euler(THREE.MathUtils.degToRad(-5),0,0) }
  ]

  return (
    <div>
      <h4>Retarget Head → Body</h4>
      <div><small>Mapped bones: {count}. Adjust scale and apply.</small></div>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <label>Head scale</label>
        <input type="range" min="0.5" max="1.5" step="0.01" value={scale} onChange={e=>setScale(parseFloat(e.target.value))} />
        <span>{scale.toFixed(2)}×</span>
      </div>
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:6}}>
        {presets.map(p => (
          <button key={p.name} className="btn" onClick={()=>{
            if (p.pos) setOffset({ position: { x: offset.position.x + p.pos.x, y: offset.position.y + p.pos.y, z: offset.position.z + p.pos.z } })
            if (p.rot) setOffset({ rotation: { x: offset.rotation.x + p.rot.x, y: offset.rotation.y + p.rot.y, z: offset.rotation.z + p.rot.z } })
          }}>{p.name}</button>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <button className="btn" onClick={async ()=>{
          try {
            const pos = new THREE.Vector3(offset.position.x, offset.position.y, offset.position.z)
            const eul = new THREE.Euler(offset.rotation.x, offset.rotation.y, offset.rotation.z)
            alignHeadToBodyNeck(head, body, scale, pos, eul)
            await rebindHeadToBody(head, body, finalMap)
            setStatus('Head aligned and rebound to body skeleton.')
          } catch (e: unknown) {
            if (e instanceof Error) {
              setStatus('Error: ' + e.message)
            } else {
              setStatus('Error: ' + String(e))
            }
          }
        }}>Apply to Head (align + rebind)</button>
      </div>
      {status && <small>{status}</small>}
    </div>
  )
}
