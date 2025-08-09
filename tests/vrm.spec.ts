import { describe, it, expect } from 'vitest'
import { extractVRMPresetsFromGLTF } from '../src/lib/vrm'

describe('VRM preset extraction', () => {
  it('reads VRM 0.x groups', () => {
    const gltf = { parser: { json: { extensions: { VRM: { blendShapeMaster: { blendShapeGroups: [
      { presetName: 'A' }, { presetName: 'Blink' }, { presetName: 'Joy' }
    ]}}}}} }
    const res = extractVRMPresetsFromGLTF(gltf as any)
    expect(res).toEqual(['A','Blink','Joy'])
  })
  it('reads VRM 1.0 presets', () => {
    const gltf = { parser: { json: { extensions: { VRMC_vrm: { expressions: { preset: { A:{}, E:{}, Blink:{} } } } } } } }
    const res = extractVRMPresetsFromGLTF(gltf as any)
    expect(new Set(res)).toEqual(new Set(['A','E','Blink']))
  })
  it('returns [] when none present', () => {
    const gltf = { parser: { json: {} } }
    expect(extractVRMPresetsFromGLTF(gltf as any)).toEqual([])
  })
})
