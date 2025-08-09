import * as THREE from 'three'

import type { LoadedFBX } from '../types'
import { attachMorph } from './morphs'

// Very lightweight procedural synthesis of a few ARKit shapes.
// We use skin weights to find vertices dominated by target bones and move them along a heuristic axis.
// NOTE: This is a practical prototype, not anatomically exact.

type GenSpec = {
  name: string
  matchBones: RegExp[]
  axis: [number,number,number] // local-ish axis to move along
  scale: number                // movement scale relative to character size
}

const SPECS: GenSpec[] = [
  { name:'jawOpen', matchBones:[/jaw/], axis:[0,-1,0], scale: 0.01 },
  { name:'eyeBlinkLeft', matchBones:[/eye_l|eyelid_l|upperlid_l|lowerlid_l/], axis:[0,-1,0], scale: 0.005 },
  { name:'eyeBlinkRight', matchBones:[/eye_r|eyelid_r|upperlid_r|lowerlid_r/], axis:[0,-1,0], scale: 0.005 },
  { name:'browInnerUp', matchBones:[/brow|eyebrow/], axis:[0,1,0], scale: 0.006 },
  { name:'mouthSmileLeft', matchBones:[/mouth|lip/], axis:[1,0,0], scale: 0.006 },
  { name:'mouthSmileRight', matchBones:[/mouth|lip/], axis:[-1,0,0], scale: 0.006 },
]

export function synthesizeARKitMorphs(asset: LoadedFBX, names?: string[]) {
  const geo = asset.geometry
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const skinIndex = geo.getAttribute('skinIndex') as THREE.BufferAttribute
  const skinWeight = geo.getAttribute('skinWeight') as THREE.BufferAttribute
  if (!pos || !skinIndex || !skinWeight) throw new Error('Missing attributes for synthesis')

  const bbox = new THREE.Box3().setFromBufferAttribute(pos)
  const diag = bbox.min.distanceTo(bbox.max) || 1

  const pick = (names && names.length) ? SPECS.filter(s=>names.includes(s.name)) : SPECS

  // Build a name->boneIdxSet cache
  const boneNames = asset.skeleton.bones.map(b=>b.name.toLowerCase())
  const boneHits = (rx:RegExp)=> {
    const set = new Set<number>()
    boneNames.forEach((n,i)=>{ if (rx.test(n)) set.add(i) })
    return set
  }

  for (const spec of pick) {
    const allowSets = spec.matchBones.map(boneHits)
    const allow = (i:number)=> allowSets.some(set => set.has(i))

    const dPos = new Float32Array(pos.array.length)

    const n = pos.count
    for (let v=0; v<n; v++) {
      // dominant influence bone index
      const idxs = [skinIndex.getX(v), skinIndex.getY(v), skinIndex.getZ(v), skinIndex.getW(v)]
      const ws = [skinWeight.getX(v), skinWeight.getY(v), skinWeight.getZ(v), skinWeight.getW(v)]
      let bestI = 0; let bestW = ws[0]
      for (let i=1;i<4;i++) if (ws[i] > bestW) { bestW = ws[i]; bestI = i }
      const boneIdx = idxs[bestI]

      if (!allow(boneIdx)) continue

      // apply simple directional offset scaled by weight
      const w = Math.max(0, Math.min(1, bestW))
      const s = spec.scale * diag * w
      const ax = spec.axis
      dPos[v*3+0] += ax[0] * s
      dPos[v*3+1] += ax[1] * s
      dPos[v*3+2] += ax[2] * s
    }

    // Only attach if there is any displacement
    let maxAbs = 0
    for (let i=0;i<dPos.length;i++) { const a = Math.abs(dPos[i]); if (a>maxAbs) maxAbs=a }
    if (maxAbs > 1e-7) {
      attachMorph(geo, spec.name, dPos)
    }
  }
}
