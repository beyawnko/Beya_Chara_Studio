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

export type RemapSkinIndexArgs = {
  src: Uint16Array | Uint32Array
  remap: Record<number, number>
  fallback: number
}

export type Jobs = {
  diffMorph(args: DiffArgs): { dPos: Float32Array; dN?: Float32Array }
  compareTopology(args: TopologyArgs): { ok: boolean; report: string[] }
  cosineSim(args: { a: Float32Array; b: Float32Array }): number
  remapSkinIndex(args: RemapSkinIndexArgs): Uint16Array | Uint32Array
}

const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4

export function createPool(url: URL, size = Math.max(1, cores - 1)) {
  const workers = Array.from({ length: size }, () => new Worker(url, { type: 'module' }))
  const remotes = workers.map(w => Comlink.wrap<Jobs>(w))
  let i = 0
  return {
    async run<K extends keyof Jobs>(fn: K, payload: Parameters<Jobs[K]>[0]): Promise<ReturnType<Jobs[K]>> {
      const r = remotes[(i = (i + 1) % remotes.length)]
      return await r[fn](payload)
    },
    dispose() {
      workers.forEach(w => w.terminate())
    }
  }
}
