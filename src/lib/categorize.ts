import * as THREE from 'three'

export type Category = 'Face'|'Body'|'Hands'|'Feet'|'Other'

// Decide category by dominant bone name patterns among displaced vertices
export function categorizeMorph(geo: THREE.BufferGeometry, skeleton: THREE.Skeleton, dPos: Float32Array, eps=1e-6): Category {
  const skinIndex = geo.getAttribute('skinIndex') as THREE.BufferAttribute
  const skinWeight = geo.getAttribute('skinWeight') as THREE.BufferAttribute
  if (!skinIndex || !skinWeight) return 'Other'

  const counts: Record<Category, number> = { Face:0, Body:0, Hands:0, Feet:0, Other:0 }

  const boneName = (i:number)=> skeleton.bones[i]?.name?.toLowerCase() ?? ''
  const nVerts = (geo.getAttribute('position') as THREE.BufferAttribute).count
  for (let v=0; v<nVerts; v++) {
    const mag = Math.abs(dPos[v*3]) + Math.abs(dPos[v*3+1]) + Math.abs(dPos[v*3+2])
    if (mag < eps) continue
    // dominant bone by weight
    const idxs = [skinIndex.getX(v), skinIndex.getY(v), skinIndex.getZ(v), skinIndex.getW(v)]
    const ws = [skinWeight.getX(v), skinWeight.getY(v), skinWeight.getZ(v), skinWeight.getW(v)]
    let bestI = 0; let bestW = ws[0]
    for (let i=1;i<4;i++) if (ws[i] > bestW) { bestW = ws[i]; bestI = i }
    const bname = boneName(idxs[bestI]).toLowerCase()

    let cat: Category = 'Other'
    if (/head|face|jaw|brow|eye|lip|mouth|tongue/.test(bname)) cat = 'Face'
    else if (/hand|finger|thumb/.test(bname)) cat = 'Hands'
    else if (/thigh|calf|foot|ball|toe|ankle/.test(bname)) cat = 'Feet'
    else if (/spine|pelvis|clavicle|chest|neck/.test(bname)) cat = 'Body'
    counts[cat]++
  }

  // pick max bucket
  let best: Category = 'Other', bestC = -1
  for (const k of Object.keys(counts) as Category[]) {
    if (counts[k] > bestC) { bestC = counts[k]; best = k }
  }
  return best
}
