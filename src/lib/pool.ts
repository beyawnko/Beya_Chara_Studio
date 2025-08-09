import * as Comlink from 'comlink'

export type DiffArgs = {
  basePos: Float32Array
  varPos: Float32Array
  baseN?: Float32Array
  varN?: Float32Array
}

export type TopologyArgs = {
  posCountA: number
  posCountB: number
  indexA?: Uint32Array | Uint16Array | null
  indexB?: Uint32Array | Uint16Array | null
}

export type Jobs = {
  diffMorph(args: DiffArgs): { dPos: Float32Array; dN?: Float32Array }
  compareTopology(args: TopologyArgs): { ok: boolean; report: string[] }
  cosineSim(args: { a: Float32Array; b: Float32Array }): number
}

export function createPool(url: URL, size = Math.max(1, (navigator.hardwareConcurrency ?? 4) - 1)) {
  const workers = Array.from({length: size}, () => new Worker(url, { type: 'module' }))
  const remotes = workers.map(w => Comlink.wrap<Jobs>(w as any))
  let i = 0
  return {
    async run<K extends keyof Jobs>(fn: K, payload: Parameters<Jobs[K]>[0]) {
      const r = remotes[i = (i + 1) % remotes.length]
      return (await r[fn](payload as any)) as ReturnType<Jobs[K]>
    },
    dispose() { workers.forEach(w => w.terminate()) }
  }
}
