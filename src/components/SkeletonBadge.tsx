import { useMemo } from 'react'
import * as THREE from 'three'

import { detectProfile } from '../lib/skeleton'
import { useCharacterStore } from '../state/useCharacterStore'
import { AnyAsset } from '../types'

export function SkeletonBadge() {
  const base = useCharacterStore(s => s.base)
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)

  const profBase = useMemo(()=> profileOf(base), [base])
  const profHead = useMemo(()=> profileOf(head), [head])
  const profBody = useMemo(()=> profileOf(body), [body])

  const compat = (a?:string, b?:string) => !a || !b || a==='Unknown' || b==='Unknown' || a===b

  const ok = compat(profBase, profHead) && compat(profBase, profBody) && compat(profHead, profBody)

  return (
    <div style={{marginTop:8}}>
      <span className="badge">Skeleton</span>
      <small>
        Base: {profBase || '—'} | Head: {profHead || '—'} | Body: {profBody || '—'}
      </small>
      <div><small style={{color: ok ? '#6f6' : '#f66'}}>{ok ? 'Profiles compatible' : 'Profiles differ (swapping may fail)'}</small></div>
    </div>
  )
}

function profileOf(asset: AnyAsset | null): string | undefined {
  if (!asset?.skeleton) return undefined
  const names = asset.skeleton.bones.map((b: THREE.Bone)=> b.name)
  return detectProfile(names)
}
