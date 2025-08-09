import * as Comlink from 'comlink'

const api = {
  diffMorph({ basePos, varPos, baseN, varN }) {
    if (basePos.length !== varPos.length) throw new Error('pos length mismatch')
    const dPos = new Float32Array(basePos.length)
    for (let i=0;i<dPos.length;i++) dPos[i] = varPos[i] - basePos[i]
    let dN
    if (baseN && varN && baseN.length === varN.length) {
      dN = new Float32Array(baseN.length)
      for (let i=0;i<dN.length;i++) dN[i] = varN[i] - baseN[i]
    }
    return { dPos, dN }
  },
  compareTopology({ posCountA, posCountB, indexA, indexB }) {
    const report:string[] = []
    if (posCountA !== posCountB) report.push(`Vertex count mismatch: ${posCountA} vs ${posCountB}`)
    const aCount = indexA?.length ?? 0
    const bCount = indexB?.length ?? 0
    if (aCount !== bCount) report.push(`Index count mismatch: ${aCount} vs ${bCount}`)
    // Optional deep compare for index order
    if (aCount === bCount && indexA && indexB) {
      for (let i=0;i<aCount;i++) if (indexA[i] !== indexB[i]) { report.push(`Index differs at ${i}`); break }
    }
    return { ok: report.length === 0, report }
  },
  cosineSim({ a, b }) {
    if (a.length !== b.length) return 0
    let dot=0, na=0, nb=0
    for (let i=0;i<a.length;i++){ const ai=a[i], bi=b[i]; dot+=ai*bi; na+=ai*ai; nb+=bi*bi }
    if (na===0 || nb===0) return 0
    return dot / Math.sqrt(na*nb)
  }
}

Comlink.expose(api)
