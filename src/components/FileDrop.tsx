import { type ChangeEvent, useCallback } from 'react'

import { useCharacterStore } from '../state/useCharacterStore'

export function FileDrop({ kind }:{ kind:'base'|'variant'|'headBase'|'headVariant'|'bodyBase'|'bodyVariant'|'garment' }) {
  const onFiles = useCharacterStore(s => s.onFiles)
  const onGarmentFiles = useCharacterStore(s => s.onGarmentFiles)
  const labelMap = {
    base: 'Upload Base FBX',
    variant: 'Upload Variant FBX',
    headBase: 'Upload Head Base FBX',
    headVariant: 'Upload Head Variant FBX',
    bodyBase: 'Upload Body Base FBX',
    bodyVariant: 'Upload Body Variant FBX',
    garment: 'Upload Garment GLB'
  } as const
  const label = labelMap[kind]
  const multi = kind==='variant' || kind==='headVariant' || kind==='bodyVariant'
  const hintMap: Record<typeof kind, string> = {
    base: 'Base first.',
    variant: 'Variants must match topology & skin.',
    headBase: 'Base first.',
    headVariant: 'Variants must match topology & skin.',
    bodyBase: 'Base first.',
    bodyVariant: 'Variants must match topology & skin.',
    garment: 'Garment must be a skinned mesh.'
  }
  const handle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (kind === 'garment') onGarmentFiles(files)
    else onFiles(kind, files)
    e.currentTarget.value = ''
  }, [kind, onFiles, onGarmentFiles])
  return (
    <div className="drop">
      <div>{label}</div>
      <input type="file" accept=".fbx,.glb,.gltf,.vrm" multiple={multi} onChange={handle} />
      <small>{hintMap[kind]}</small>
    </div>
  )
}
