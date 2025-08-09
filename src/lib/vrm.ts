// Minimal extraction of VRM preset expression names from GLTF JSON
// Supports legacy VRM (0.x) and VRM 1.0 (VRMC_vrm)

export function extractVRMPresetsFromGLTF(gltf: any): string[] {
  const json = gltf?.parser?.json
  if (!json) return []

  // VRM 0.x
  const legacy = json.extensions?.VRM
  if (legacy?.blendShapeMaster?.blendShapeGroups) {
    const groups = legacy.blendShapeMaster.blendShapeGroups as any[]
    const presets = groups.map(g => g.presetName).filter(Boolean)
    if (presets.length) return presets
  }

  // VRM 1.0 (VRMC_vrm)
  const v1 = json.extensions?.VRMC_vrm
  if (v1?.expressions?.preset) {
    const preset = v1.expressions.preset
    const names = Object.keys(preset)
    if (names.length) return names
  }

  return []
}
