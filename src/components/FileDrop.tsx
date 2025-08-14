import { type ChangeEvent, useCallback } from 'react'

import { type Part, useCharacterStore } from '../state/useCharacterStore'

const labelMap = {
  base: 'Upload Base FBX',
  variant: 'Upload Variant FBX',
  headBase: 'Upload Head Base FBX',
  headVariant: 'Upload Head Variant FBX',
  bodyBase: 'Upload Body Base FBX',
  bodyVariant: 'Upload Body Variant FBX',
  garment: 'Upload Garment GLB'
} as const

const getHintText = (k: Part) => {
  if (k === 'garment') return 'Garment must be a skinned mesh.'
  return k.endsWith('Base') ? 'Base first.' : 'Variants must match topology & skin.'
}

export function FileDrop({ kind }: { kind: Part }) {
  const onFiles = useCharacterStore(s => s.onFiles)
  const label = labelMap[kind]
  const multi = kind.endsWith('Variant')
  const handle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    onFiles(kind, files)
    e.currentTarget.value = ''
  }, [kind, onFiles])
  return (
    <div className="drop">
      <div>{label}</div>
      <input type="file" accept={kind === 'garment' ? '.glb' : '.fbx,.glb,.gltf,.vrm'} multiple={multi} onChange={handle} />
      <small>{getHintText(kind)}</small>
    </div>
  )
}
