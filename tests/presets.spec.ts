import { describe, expect,it } from 'vitest'

import { getPresetMap } from '../src/lib/retargetPresets'

describe('retarget presets', () => {
  it('VRM_to_UE5 includes Head and Neck', () => {
    const m = getPresetMap('VRM_to_UE5')
    expect(m['J_Head']).toBeTruthy()
    expect(m['J_Neck']).toBeTruthy()
  })
})
