import * as THREE from 'three'

import type { LoadedFBX } from '../types'
import { createPool } from './pool'
import { detectProfile,PROFILES } from './skeleton'

export type BoneMap = Record<string, string>

const NECK_ALIASES = ['neck_01','neck','J_Neck','UpperChest','upperChest']
let pool: ReturnType<typeof createPool> | null = null

export function retargetPool() {
  if (!pool) pool = createPool(new URL('../workers/retarget.worker.ts', import.meta.url))
  return pool
}

export function disposeRetargetPool() {
  if (pool) {
    pool.dispose()
    pool = null
  }
}

export function suggestBoneMap(src: THREE.Skeleton, dst: THREE.Skeleton): BoneMap {
  const map: BoneMap = {}
  const srcNames = src.bones.map(b=>b.name)
  const dstNamesLower = dst.bones.map(b=>b.name.toLowerCase())
  const profSrc = detectProfile(srcNames)
  const profDst = detectProfile(dst.bones.map(b=>b.name))
  const srcProfile = PROFILES.find(p=>p.name===profSrc)
  const dstProfile = PROFILES.find(p=>p.name===profDst)

  function bestMatch(name: string): string | null {
    const nlow = name.toLowerCase()
    const exactIdx = dstNamesLower.indexOf(nlow)
    if (exactIdx >= 0) return dst.bones[exactIdx].name
    let aliases: string[] = []
    if (srcProfile) {
      for (const [canon, al] of Object.entries(srcProfile.canonical)) {
        if ((al as string[]).map(x=>x.toLowerCase()).includes(nlow)) {
          const dstAliases = dstProfile?.canonical[canon]
          if (dstAliases) aliases = dstAliases as string[]
          break
        }
      }
    }
    aliases = aliases.length ? aliases : [name, nlow.replace('left','_l').replace('right','_r')]
    for (const a of aliases) {
      const i = dstNamesLower.indexOf(a.toLowerCase())
      if (i>=0) return dst.bones[i].name
    }
    return null
  }

  for (const s of srcNames) {
    const t = bestMatch(s)
    if (t) map[s] = t
  }
  return map
}

export function pickNeckBone(skel: THREE.Skeleton): THREE.Bone | null {
  const names = skel.bones.map(b=>b.name)
  for (const cand of NECK_ALIASES) {
    const i = names.findIndex(n => n.toLowerCase() === cand.toLowerCase())
    if (i>=0) return skel.bones[i]
  }
  let neck = skel.bones.find(b=>/neck/i.test(b.name)) || null
  if (!neck) {
    const spine = skel.bones.filter(b=>/spine/i.test(b.name)).slice(-1)[0]
    if (spine) neck = spine as THREE.Bone
  }
  return neck
}

export function alignHeadToBodyNeck(head: LoadedFBX, body: LoadedFBX, scale=1, offsetPos?: THREE.Vector3, offsetEuler?: THREE.Euler) {
  const neck = pickNeckBone(body.skeleton)
  if (!neck) throw new Error('Could not locate neck on body skeleton')
  body.mesh.updateMatrixWorld(true)
  neck.updateWorldMatrix(true, false)
  const m = new THREE.Matrix4()
  m.copy(neck.matrixWorld)
  const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3()
  m.decompose(pos, quat, scl)
  head.mesh.position.copy(pos)
  head.mesh.quaternion.copy(quat)
  head.mesh.scale.setScalar(scale)
  if (offsetPos) head.mesh.position.add(offsetPos)
  if (offsetEuler) {
    head.mesh.rotation.x += offsetEuler.x
    head.mesh.rotation.y += offsetEuler.y
    head.mesh.rotation.z += offsetEuler.z
  }
  head.mesh.updateMatrixWorld(true)
}

export async function rebindHeadToBody(head: LoadedFBX, body: LoadedFBX, map: BoneMap) {
  const geo = head.geometry
  const skinIndex = geo.getAttribute('skinIndex') as THREE.BufferAttribute
  const skinWeight = geo.getAttribute('skinWeight') as THREE.BufferAttribute
  if (!skinIndex || !skinWeight) throw new Error('Head missing skin attributes')

  const srcIndexByName: Record<string, number> = {}
  head.skeleton.bones.forEach((b,i)=> srcIndexByName[b.name] = i)
  const dstIndexByName: Record<string, number> = {}
  body.skeleton.bones.forEach((b,i)=> dstIndexByName[b.name] = i)

  const neck = pickNeckBone(body.skeleton)
  const neckIdx = neck ? body.skeleton.bones.indexOf(neck) : 0

  const remap: Record<number, number> = {}
  for (const [sName, tName] of Object.entries(map)) {
    const si = srcIndexByName[sName]
    const ti = dstIndexByName[tName]
    if (si != null && ti != null) remap[si] = ti
  }

  const skinSrc = skinIndex.array as Uint16Array | Uint32Array
  const out = await retargetPool().run('remapSkinIndex', {
    src: skinSrc,
    remap,
    fallback: neckIdx
  })
  geo.setAttribute('skinIndex', new THREE.BufferAttribute(out, 4))
  head.mesh.bind(body.skeleton)
}
