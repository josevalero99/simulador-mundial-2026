import { describe, it, expect } from 'vitest'
import { generateFixtures } from './fixtures'
describe('generateFixtures', () => {
  const f = generateFixtures()
  it('produces 72 matches (6 per group × 12)', () => { expect(f).toHaveLength(72) })
  it('each group is a round-robin: each team plays 3 times', () => {
    const byGroup: Record<string,string[]> = {}
    f.forEach(m => { (byGroup[m.group] ??= []).push(m.home, m.away) })
    for (const teams of Object.values(byGroup)) {
      const counts = new Map<string,number>()
      teams.forEach(t => counts.set(t,(counts.get(t)??0)+1))
      expect([...counts.values()].every(c=>c===3)).toBe(true)
    }
  })
  it('every match starts with null scores', () => {
    expect(f.every(m => m.homeGoals===null && m.awayGoals===null)).toBe(true)
  })
  it('unique match ids', () => { expect(new Set(f.map(m=>m.id)).size).toBe(72) })
})
