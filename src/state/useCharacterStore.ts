import * as THREE from 'three'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { loadAny } from '../lib/importers'
import { addVariantAsMorph } from '../lib/morphs'
import type { AnyAsset } from '../types'

type Part = 'base'|'variant'|'headBase'|'headVariant'|'bodyBase'|'bodyVariant'
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
  onGarmentFiles: (files: File[]) => Promise<void>
  setMorphWeight: (key:string, v:number)=>void
  setActivePart: (p:ActivePart)=>void
  setMaterialAssign: (key:string, v:'head'|'body'|'none')=>void
  setBoneMap: (src:string, dst:string)=>void
  setHeadOffset: (o: Partial<{ position: Vec3, rotation: Vec3, scale: number }>)=>void
  setSelectedBones: (src?:string, dst?:string)=>void
  refreshMorphKeys: (asset: AnyAsset)=>void
  clearErrors: ()=>void
}

const pushError = (set:(fn:(s:State)=>State)=>void, msg:string) => {
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
      try {
      if (kind === 'base') {
        const asset = await loadAny(files[0])
        set({ base: asset, morphKeys: [], morphWeights: {}, variants: [], errors: [] })
        return
      }
      if (kind === 'variant') {
        const base = get().base
          if (!base) { pushError(set, 'Upload base first.'); return }
        for (const f of files) {
          try {
            const v = await loadAny(f, { asVariantOf: base })
            const key = await addVariantAsMorph(base, v)
            set(s => ({ variants: [...s.variants, f.name], morphKeys: [...s.morphKeys, key] }))
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
              pushError(set, `${f.name}: ${msg}`)
          }
        }
        return
      }
      if (kind === 'headBase') {
        const asset = await loadAny(files[0])
        set({ head: asset, errors: [] })
        return
      }
      if (kind === 'headVariant') {
        const head = get().head
          if (!head) { pushError(set, 'Upload head base first.'); return }
        for (const f of files) {
          try {
            const v = await loadAny(f, { asVariantOf: head })
            const key = await addVariantAsMorph(head, v)
            set(s => ({ variants: [...s.variants, f.name], morphKeys: [...s.morphKeys, key] }))
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
              pushError(set, `${f.name}: ${msg}`)
          }
        }
        return
      }
      if (kind === 'bodyBase') {
        const asset = await loadAny(files[0])
        set({ body: asset, errors: [] })
        return
      }
      if (kind === 'bodyVariant') {
        const body = get().body
          if (!body) { pushError(set, 'Upload body base first.'); return }
        for (const f of files) {
          try {
            const v = await loadAny(f, { asVariantOf: body })
            const key = await addVariantAsMorph(body, v)
            set(s => ({ variants: [...s.variants, f.name], morphKeys: [...s.morphKeys, key] }))
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
              pushError(set, `${f.name}: ${msg}`)
          }
        }
        return
      }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        pushError(set, msg)
      }
    },
    onGarmentFiles: async (files) => {
      if (!files.length) return
      try {
      const asset = await loadAny(files[0])
      set({ garment: asset, errors: [] })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        pushError(set, msg)
      }
    }
  }), {
  name:'char-morphs',
  partialize: s => ({ materialAssign: s.materialAssign, boneMap: s.boneMap, headOffset: s.headOffset, morphWeights: s.morphWeights }),
}))
