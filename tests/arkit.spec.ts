import { describe, expect,it } from 'vitest'

import { ARKIT_52, generateARKitSetFromVRM } from '../src/lib/arkit'

describe('ARKit set', () => {
  it('has 52 unique names', () => {
    const set = new Set(ARKIT_52)
    expect(set.size).toBe(52)
  })
  it('generator covers all names', () => {
    const res = generateARKitSetFromVRM(['A','E','I','O','U','Blink','Joy','Angry','Sorrow','Surprised'])
    expect(res.length).toBe(52)
    const missing = ARKIT_52.filter(n => !res.find(r => r.name === n))
    expect(missing).toEqual([])
  })
})
