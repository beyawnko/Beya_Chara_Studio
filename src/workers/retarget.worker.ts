import * as Comlink from 'comlink'

const api = {
  remapSkinIndex({ src, remap, fallback }) {
    const out = new (src.constructor as any)(src.length)
    for (let i=0;i<src.length;i++) {
      const si = src[i]
      out[i] = (remap[si] != null) ? remap[si] : fallback
    }
    return out
  }
}
Comlink.expose(api)
