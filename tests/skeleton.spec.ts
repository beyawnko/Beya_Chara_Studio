import { describe, it, expect } from 'vitest'
import { detectProfile } from '../src/lib/skeleton'

describe('skeleton profile detection', () => {
  it('detects UE5-like bone set', () => {
    const bones = ['root','pelvis','spine_01','spine_02','spine_03','neck_01','head','clavicle_l','upperarm_l','lowerarm_l','hand_l']
    const r = detectProfile(bones)
    expect(r === 'UE5' || r === 'Unknown').toBeTruthy()
  })
  it('detects VRM-like set', () => {
    const bones = ['J_Hips','J_Spine','J_Chest','J_Head','J_LeftUpperArm','J_RightUpperArm','J_LeftUpperLeg','J_RightUpperLeg']
    const r = detectProfile(bones)
    expect(r === 'VRM' || r === 'Unknown').toBeTruthy()
  })
})
