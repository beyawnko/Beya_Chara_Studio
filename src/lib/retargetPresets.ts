export type PresetKey = 'VRM_to_UE5' | 'VRM_to_Mixamo' | 'VRM_to_MMD'

// Minimal but useful head/neck/eyes/jaw set; extend as needed.
const VRM_to_UE5: Record<string,string> = {
  'J_Head': 'head',
  'J_Neck': 'neck_01',
  'J_Jaw':  'jaw',
  'J_LeftEye': 'eye_l',
  'J_RightEye': 'eye_r'
}

const VRM_to_Mixamo: Record<string,string> = {
  'J_Head': 'Head',
  'J_Neck': 'Neck',
  'J_Jaw':  'Jaw',
  'J_LeftEye': 'LeftEye',
  'J_RightEye': 'RightEye'
}

const VRM_to_MMD: Record<string,string> = {
  'J_Head': '頭',
  'J_Neck': '首',
  'J_Jaw':  'あご',
  'J_LeftEye': '左目',
  'J_RightEye': '右目'
}

export const PRESET_MAPS: Record<PresetKey, Record<string,string>> = {
  VRM_to_UE5: VRM_to_UE5,
  VRM_to_Mixamo: VRM_to_Mixamo,
  VRM_to_MMD: VRM_to_MMD
}

export function getPresetMap(key: PresetKey): Record<string,string> {
  return { ...PRESET_MAPS[key] }
}
