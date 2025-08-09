export type SkeletonProfile = {
  name: 'VRM'|'UE4'|'UE5'|'MMD'|'UnityHumanoid'|'Unknown'
  canonical: Record<string, string[]> // canonicalBoneName -> aliases
}

// Minimal seed; extend over time.
export const PROFILES: SkeletonProfile[] = [
  {
    name: 'UE5',
    canonical: {
      root: ['root'],
      pelvis: ['pelvis'],
      spine_01: ['spine_01','spine1'],
      spine_02: ['spine_02','spine2'],
      spine_03: ['spine_03','spine3'],
      neck_01: ['neck_01','neck'],
      head: ['head'],
      clavicle_l: ['clavicle_l','clavicle_l'],
      upperarm_l: ['upperarm_l','upperarm_l'],
      lowerarm_l: ['lowerarm_l','lowerarm_l'],
      hand_l: ['hand_l','hand_l'],
      clavicle_r: ['clavicle_r'],
      upperarm_r: ['upperarm_r'],
      lowerarm_r: ['lowerarm_r'],
      hand_r: ['hand_r'],
      thigh_l: ['thigh_l'],
      calf_l: ['calf_l','shin_l'],
      foot_l: ['foot_l'],
      ball_l: ['ball_l','toe_l'],
      thigh_r: ['thigh_r'],
      calf_r: ['calf_r','shin_r'],
      foot_r: ['foot_r'],
      ball_r: ['ball_r','toe_r'],
      jaw: ['jaw','jawbone'],
      eye_l: ['eye_l','eyeball_l'],
      eye_r: ['eye_r','eyeball_r']
    }
  },
  {
    name: 'VRM',
    canonical: {
      hips: ['J_Hips','hips','Hip'],
      spine: ['J_Spine','spine'],
      chest: ['J_Chest','chest'],
      upperChest: ['J_UpperChest','upperChest'],
      neck: ['J_Neck','neck'],
      head: ['J_Head','head'],
      leftEye: ['J_LeftEye','leftEye'],
      rightEye: ['J_RightEye','rightEye'],
      leftUpperArm: ['J_LeftUpperArm','leftUpperArm'],
      leftLowerArm: ['J_LeftLowerArm','leftLowerArm'],
      leftHand: ['J_LeftHand','leftHand'],
      rightUpperArm: ['J_RightUpperArm','rightUpperArm'],
      rightLowerArm: ['J_RightLowerArm','rightLowerArm'],
      rightHand: ['J_RightHand','rightHand'],
      leftUpperLeg: ['J_LeftUpperLeg','leftUpperLeg'],
      leftLowerLeg: ['J_LeftLowerLeg','leftLowerLeg'],
      leftFoot: ['J_LeftFoot','leftFoot'],
      rightUpperLeg: ['J_RightUpperLeg','rightUpperLeg'],
      rightLowerLeg: ['J_RightLowerLeg','rightLowerLeg'],
      rightFoot: ['J_RightFoot','rightFoot'],
      jaw: ['J_Jaw','jaw']
    }
  },
  {
    name: 'MMD',
    canonical: {
      center: ['センター','center'],
      upper_body: ['上半身','upper_body'],
      neck: ['首','neck'],
      head: ['頭','head'],
      left_arm: ['左腕','left_arm'],
      left_elbow: ['左ひじ','left_elbow'],
      left_wrist: ['左手首','left_wrist'],
      right_arm: ['右腕','right_arm'],
      right_elbow: ['右ひじ','right_elbow'],
      right_wrist: ['右手首','right_wrist'],
      left_leg: ['左足','left_leg'],
      left_knee: ['左ひざ','left_knee'],
      left_ankle: ['左足首','left_ankle'],
      right_leg: ['右足','right_leg'],
      right_knee: ['右ひざ','right_knee'],
      right_ankle: ['右足首','right_ankle']
    }
  }
]

export function detectProfile(boneNames: string[]): SkeletonProfile['name'] {
  const lower = boneNames.map(b=>b.toLowerCase())
  for (const p of PROFILES) {
    let hits = 0
    for (const aliases of Object.values(p.canonical)) {
      if (aliases.some(a => lower.includes(a.toLowerCase()))) hits++
    }
    if (hits >= 8) return p.name
  }
  return 'Unknown'
}
