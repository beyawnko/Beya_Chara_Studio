import * as THREE from 'three'

import type { LoadedFBX } from '../types'
import { categorizeMorph } from './categorize'
import { createPool } from './pool'

let pool: ReturnType<typeof createPool> | null = null

export function morphPool() {
  if (!pool) pool = createPool(new URL('../workers/morph.worker.ts', import.meta.url))
  return pool
}

export function disposeMorphPool() {
  if (pool) {
    pool.dispose()
    pool = null
  }
}

export async function addVariantAsMorph(base: LoadedFBX, variant: LoadedFBX): Promise<string> {
  const a = base.geometry
  const b = variant.geometry
  if (!a.getAttribute('position') || !b.getAttribute('position')) throw new Error('Missing positions')
  const idxA = a.getIndex(); const idxB = b.getIndex()
  const compare = await morphPool().run('compareTopology', {
    posCountA: a.getAttribute('position').count,
    posCountB: b.getAttribute('position').count,
    indexA: idxA?.array ?? null,
    indexB: idxB?.array ?? null
  })
  if (!compare.ok) throw new Error('Topology mismatch: ' + compare.report.join(' | '))

  const basePos = (a.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  const varPos  = (b.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
  const baseN = (a.getAttribute('normal') as THREE.BufferAttribute)?.array as Float32Array
  const varN  = (b.getAttribute('normal') as THREE.BufferAttribute)?.array as Float32Array

  const { dPos, dN } = await morphPool().run('diffMorph', { basePos, varPos, baseN, varN })

  // similarity vs existing morphs (position only)
  const existing = a.morphAttributes.position ?? []
  let duplicateOf: string | null = null
  for (let i=0;i<existing.length;i++) {
    const sim = await morphPool().run('cosineSim', { a: existing[i].array as Float32Array, b: dPos })
    if (sim >= 0.98) {
      // get morph name by reverse lookup
      const dict = a.morphTargetsDictionary || {}
      const nameAtI = Object.keys(dict).find(k => dict[k] === i) || `Morph${i}`
      duplicateOf = nameAtI
      break
    }
  }

  const name = sanitizeMorphName(variant.name)
  attachMorph(a, name, dPos, dN)

  // category
  const category = categorizeMorph(a, base.skeleton, dPos)

  // bind to base mesh
  const idx = (a.morphAttributes.position?.length ?? 1) - 1
  base.mesh.morphTargetInfluences ??= []
  base.mesh.morphTargetDictionary ??= {}
  base.mesh.morphTargetDictionary[name] = idx

  // stash metadata on geometry for UI (not serialized)
  const meta = a.__morphMeta ?? (a.__morphMeta = {})
  meta[name] = { category, duplicateOf }

  return name
}

export function getMorphMeta(geo: THREE.BufferGeometry): Record<string, {category:string, duplicateOf:string|null}> {
  return geo.__morphMeta ?? {}
}

export function attachMorph(geo: THREE.BufferGeometry, name: string, dPos: Float32Array, dN?: Float32Array) {
  (geo.morphAttributes.position ??= []).push(new THREE.BufferAttribute(dPos, 3))
  if (dN) (geo.morphAttributes.normal ??= []).push(new THREE.BufferAttribute(dN, 3))
  geo.morphTargetsRelative = true
  geo.morphTargetsDictionary ??= {}
  geo.morphTargetsDictionary[name] = (geo.morphAttributes.position!.length - 1)
}

function sanitizeMorphName(s: string) {
  return s.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').slice(0, 48)
}
