// ARKit 52 shape names (Perfect Sync). Keep exact names.
export const ARKIT_52 = [
  'browDownLeft','browDownRight','browInnerUp','browOuterUpLeft','browOuterUpRight',
  'cheekPuff','cheekSquintLeft','cheekSquintRight','eyeBlinkLeft','eyeBlinkRight',
  'eyeLookDownLeft','eyeLookDownRight','eyeLookInLeft','eyeLookInRight','eyeLookOutLeft',
  'eyeLookOutRight','eyeLookUpLeft','eyeLookUpRight','eyeSquintLeft','eyeSquintRight',
  'eyeWideLeft','eyeWideRight','jawForward','jawLeft','jawOpen','jawRight',
  'mouthClose','mouthDimpleLeft','mouthDimpleRight','mouthFrownLeft','mouthFrownRight',
  'mouthFunnel','mouthLeft','mouthLowerDownLeft','mouthLowerDownRight','mouthPressLeft',
  'mouthPressRight','mouthPucker','mouthRight','mouthRollLower','mouthRollUpper',
  'mouthShrugLower','mouthShrugUpper','mouthSmileLeft','mouthSmileRight','mouthStretchLeft',
  'mouthStretchRight','mouthUpperUpLeft','mouthUpperUpRight','noseSneerLeft','noseSneerRight',
  'tongueOut'
] as const

export type ARKitName = typeof ARKIT_52[number]

export type VRMPreset = 'A'|'E'|'I'|'O'|'U'|'Blink'|'Joy'|'Angry'|'Sorrow'|'Surprised'

export type GeneratedShape = {
  name: ARKitName
  source: ('VRM'|'SYNTH')[]
  confidence: number
}

// Deterministic baseline mapping. We assume availability of VRM vowels + Blink+Joy sets.
const DIRECT_RULES: Partial<Record<ARKitName, { from: VRMPreset[], weight?: number[] }>> = {
  eyeBlinkLeft:  { from: ['Blink'] },
  eyeBlinkRight: { from: ['Blink'] },
  mouthSmileLeft:  { from: ['Joy'] },
  mouthSmileRight: { from: ['Joy'] },
  jawOpen: { from: ['A'] },
  mouthFunnel: { from: ['O'] },
  mouthPucker: { from: ['O'] },
  mouthClose: { from: ['E'] },
  mouthWide: undefined as any // not in 52; keep for future
}

export function generateARKitSetFromVRM(available: VRMPreset[]): GeneratedShape[] {
  const have = new Set(available)
  const out: GeneratedShape[] = []

  for (const name of ARKIT_52) {
    const rule = (DIRECT_RULES as any)[name]
    if (rule && rule.from.every((p:VRMPreset)=>have.has(p))) {
      out.push({ name: name as ARKitName, source: ['VRM'], confidence: 0.8 })
    } else {
      // synth placeholder; real impl would solve deltas via least-squares on landmarks
      out.push({ name: name as ARKitName, source: ['SYNTH'], confidence: 0.5 })
    }
  }
  return out
}
