import type { AnyAsset } from './importers'
import { loadAny } from './importers'
import type { LoadedFBX } from '../types'

type Opts = { asVariantOf?: LoadedFBX }

export async function loadFBX(file: File, opts: Opts = {}): Promise<AnyAsset> {
  return loadAny(file, opts)
}
