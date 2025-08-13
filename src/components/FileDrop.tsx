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
  const multi = kind.endsWith('Variant')
  const getHintText = (k: typeof kind) => {
    if (k === 'garment') return 'Garment must be a skinned mesh.'
    return k.endsWith('Base') ? 'Base first.' : 'Variants must match topology & skin.'
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
      <input type="file" accept={kind === 'garment' ? '.glb' : '.fbx,.glb,.gltf,.vrm'} multiple={multi} onChange={handle} />
      <small>{getHintText(kind)}</small>
    </div>
  )
}
