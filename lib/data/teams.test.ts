import { describe, it, expect } from 'vitest'
import { TEAMS } from './teams'
describe('TEAMS', () => {
  it('has 48 teams', () => { expect(Object.keys(TEAMS)).toHaveLength(48) })
  it('keys match ids', () => { for (const [k,t] of Object.entries(TEAMS)) expect(t.id).toBe(k) })
  it('has exactly 12 teams per pot', () => {
    for (const p of [1,2,3,4]) expect(Object.values(TEAMS).filter(t=>t.pot===p)).toHaveLength(12)
  })
})
