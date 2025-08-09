import React from 'react'

import { ActivePart,useCharacterStore } from '../state/useCharacterStore'

export function PartTabs() {
  const part = useCharacterStore(s => s.activePart)
  const setPart = useCharacterStore(s => s.setActivePart)
  const btn = (p: ActivePart, label:string) => (
    <button className="btn" style={{marginRight:6, background: part===p ? '#2a2a2a' : undefined}} onClick={()=>setPart(p)}>
      {label}
    </button>
  )
  return (
    <div style={{margin:'8px 0'}}>
      {btn('base','Full Body')}
      {btn('head','Head')}
      {btn('body','Body')}
    </div>
  )
}
