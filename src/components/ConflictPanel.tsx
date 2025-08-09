import React from 'react'

import { useCharacterStore } from '../state/useCharacterStore'

export function ConflictPanel() {
  const errors = useCharacterStore(s => s.errors)
  if (errors.length === 0) return null
  return (
    <div style={{background:'#1e1010', border:'1px solid #522', padding:8, borderRadius:8}}>
      <strong>Issues</strong>
      <ul>
        {errors.map((e,i)=>(<li key={i}><small>{e}</small></li>))}
      </ul>
    </div>
  )
}
