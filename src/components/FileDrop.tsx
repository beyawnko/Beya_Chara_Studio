import React, { useCallback } from 'react'
import { useCharacterStore } from '../state/useCharacterStore'

export function FileDrop({ kind }:{ kind:'base'|'variant'|'headBase'|'headVariant'|'bodyBase'|'bodyVariant' }) {
  const onFiles = useCharacterStore(s => s.onFiles)
  const labelMap = {
    base: 'Upload Base FBX',
    variant: 'Upload Variant FBX',
    headBase: 'Upload Head Base FBX',
    headVariant: 'Upload Head Variant FBX',
    bodyBase: 'Upload Body Base FBX',
    bodyVariant: 'Upload Body Variant FBX'
  } as const
  const label = labelMap[kind]
  const multi = kind==='variant' || kind==='headVariant' || kind==='bodyVariant'
  const handle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    onFiles(kind as any, files)
    e.currentTarget.value = ''
  }, [kind, onFiles])
  return (
    <div className="drop">
      <div>{label}</div>
      <input type="file" accept=".fbx" multiple={multi} onChange={handle} />
      <small>{kind.endsWith('Base') ? 'Base first.' : 'Variants must match topology & skin.'}</small>
    </div>
  )
}
