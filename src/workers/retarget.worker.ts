import * as Comlink from 'comlink'

import { RemapSkinIndexArgs } from '../lib/pool'

const api = {
  remapSkinIndex({ src, remap, fallback }: RemapSkinIndexArgs) {
    const out = new src.constructor(src.length)
    for (let i=0;i<src.length;i++) {
      const si = src[i]
      out[i] = (remap[si] != null) ? remap[si] : fallback
    }
    return out
  }
}
Comlink.expose(api)
