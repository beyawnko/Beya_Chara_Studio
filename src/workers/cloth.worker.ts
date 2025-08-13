import * as Comlink from 'comlink'

type SimInput = {
  positions: Float32Array
}

const api = {
  simulate({ positions }: SimInput) {
    // stub: no-op simulation
    return positions
  },
}

Comlink.expose(api)
