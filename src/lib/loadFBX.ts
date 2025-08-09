import type { LoadedFBX } from '../types'
import type { AnyAsset } from './importers'
import { loadAny } from './importers'

type Opts = { asVariantOf?: LoadedFBX }

export async function loadFBX(file: File, opts: Opts = {}): Promise<AnyAsset> {
  return loadAny(file, opts)
}
