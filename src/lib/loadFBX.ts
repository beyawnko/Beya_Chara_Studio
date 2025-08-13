import type { AnyAsset, LoadedFBX } from '../types'
import { loadAny } from './importers'

type Opts = { asVariantOf?: LoadedFBX }

export async function loadFBX(file: File, opts: Opts = {}): Promise<AnyAsset> {
  return loadAny(file, opts)
}
