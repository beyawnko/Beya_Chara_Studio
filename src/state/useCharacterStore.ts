import * as THREE from 'three'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { loadAny } from '../lib/importers'
import { addVariantAsMorph } from '../lib/morphs'
import type { AnyAsset } from '../types'

export type Part = 'base'|'variant'|'headBase'|'headVariant'|'bodyBase'|'bodyVariant'|'garment'
export type ActivePart = 'base'|'head'|'body'
type Vec3 = { x:number, y:number, z:number }

type State = {
  base: AnyAsset | null
  head: AnyAsset | null
  body: AnyAsset | null
  garment: AnyAsset | null
  activePart: ActivePart
  errors: string[]
  variants: string[]
  morphKeys: string[]
  morphWeights: Record<string, number>
  materialAssign: Record<string, 'head'|'body'|'none'>
  boneMap: Record<string, string>
  headOffset: { position: Vec3, rotation: Vec3, scale: number }
  selSrcBone?: string
  selDstBone?: string
  onFiles: (kind:Part, files: File[]) => Promise<void>
  setMorphWeight: (key:string, v:number)=>void
  setActivePart: (p:ActivePart)=>void
  setMaterialAssign: (key:string, v:'head'|'body'|'none')=>void
  setBoneMap: (src:string, dst:string)=>void
  setHeadOffset: (o: Partial<{ position: Vec3, rotation: Vec3, scale: number }>)=>void
  setSelectedBones: (src?:string, dst?:string)=>void
  refreshMorphKeys: (asset: AnyAsset)=>void
  clearErrors: ()=>void
}

const pushError = (
  set: (fn: (s: State) => Partial<State>) => void,
  msg: string
) => {
  set(s => ({ errors: [...s.errors, msg] }))
}

export const useCharacterStore = create<State>()(persist((set,get)=> ({
  base: null,
  head: null,
  body: null,
  garment: null,
  activePart: 'base',
  errors: [],
  variants: [],
  morphKeys: [],
  morphWeights: {},
  materialAssign: {},
  boneMap: {},
  headOffset: { position:{x:0,y:0,z:0}, rotation:{x:0,y:0,z:0}, scale:1 },
  selSrcBone: undefined,
  selDstBone: undefined,
  clearErrors: () => set({ errors: [] }),
  setActivePart: (p) => set({ activePart: p }),
  setMorphWeight: (key, v) => set(s => ({ morphWeights: { ...s.morphWeights, [key]: v } })),
  setMaterialAssign: (key, v) => set(s => ({ materialAssign: { ...s.materialAssign, [key]: v } })),
  setBoneMap: (src, dst) => set(s => ({ boneMap: { ...s.boneMap, [src]: dst } })),
  setHeadOffset: (o) => set(s => ({ headOffset: { 
    position: o.position ?? s.headOffset.position,
    rotation: o.rotation ?? s.headOffset.rotation,
    scale: o.scale ?? s.headOffset.scale
  }})),
  setSelectedBones: (src, dst) => set({ selSrcBone: src, selDstBone: dst }),
  refreshMorphKeys: (asset) => set(s => {
    const dict = (asset.geometry as THREE.BufferGeometry & { morphTargetsDictionary?: Record<string, number> }).morphTargetsDictionary || {}
    const keys = Object.keys(dict)
    const weights = Object.fromEntries(keys.map(k => [k, s.morphWeights[k] ?? 0]))
    return { morphKeys: keys, morphWeights: weights }
  }),
  onFiles: async (kind, files) => {
    if (!files.length) return
    const baseMap = { base: 'base', headBase: 'head', bodyBase: 'body' } as const
    const variantMap = { variant: 'base', headVariant: 'head', bodyVariant: 'body' } as const
    try {
      if (kind === 'garment') {
        const asset = await loadAny(files[0])
        set({ garment: asset, errors: [] })
        return
      }
      if (kind in baseMap) {
        const asset = await loadAny(files[0])
        const key = baseMap[kind]
        if (key === 'base') {
          set({ base: asset, morphKeys: [], morphWeights: {}, variants: [], errors: [] })
        } else {
          set({ [key]: asset, errors: [] })
        }
        return
      }
      if (kind in variantMap) {
        const parentKey = variantMap[kind]
        const parent = get()[parentKey]
        if (!parent) {
          const name = parentKey === 'base' ? 'base' : `${parentKey} base`
          pushError(set, `Upload ${name} first.`)
          return
        }
        for (const f of files) {
          try {
            const v = await loadAny(f, { asVariantOf: parent })
            const key = await addVariantAsMorph(parent, v)
            set(s => ({ variants: [...s.variants, f.name], morphKeys: [...s.morphKeys, key] }))
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            pushError(set, `${f.name}: ${msg}`)
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      pushError(set, msg)
    }
  }
  }), {
  name:'char-morphs',
  partialize: s => ({ materialAssign: s.materialAssign, boneMap: s.boneMap, headOffset: s.headOffset, morphWeights: s.morphWeights }),
}))
