import { describe, it, expect } from 'vitest'
import { THIRDS_ALLOCATION } from './thirdsAllocation'
import { THIRD_SLOT_MATCHES } from './r32'

const SLOTS = [...THIRD_SLOT_MATCHES].sort((a, b) => a - b)

describe('THIRDS_ALLOCATION', () => {
  it('has 495 combinations', () => {
    expect(Object.keys(THIRDS_ALLOCATION)).toHaveLength(495)
  })

  it('each key is 8 sorted distinct group letters', () => {
    for (const key of Object.keys(THIRDS_ALLOCATION)) {
      expect(key).toHaveLength(8)
      const letters = [...key]
      expect([...letters].sort().join('')).toBe(key)
      expect(new Set(letters).size).toBe(8)
    }
  })

  it('each combination maps the 8 third-slots to 8 distinct groups drawn from the combo', () => {
    for (const [combo, map] of Object.entries(THIRDS_ALLOCATION)) {
      const slots = Object.keys(map).map(Number).sort((a, b) => a - b)
      expect(slots).toEqual(SLOTS)
      const groups = Object.values(map)
      expect(new Set(groups).size).toBe(8)
      groups.forEach((g) => expect(combo.includes(g)).toBe(true))
    }
  })
})
