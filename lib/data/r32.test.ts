import { describe, it, expect } from 'vitest'
import { R32, THIRD_SLOT_MATCHES, R16, QF, SF, FINAL } from './r32'

describe('R32 pairings', () => {
  it('has 16 matches numbered 73–88', () => {
    expect(R32).toHaveLength(16)
    expect(R32.map((m) => m.match)).toEqual(Array.from({ length: 16 }, (_, i) => 73 + i))
  })

  it('third-slot matches are exactly the away slots of kind "third"', () => {
    const thirdMatches = R32.filter((m) => m.away.kind === 'third' || m.home.kind === 'third').map((m) => m.match)
    expect(thirdMatches.sort((a, b) => a - b)).toEqual([...THIRD_SLOT_MATCHES].sort((a, b) => a - b))
  })

  it('every "third" slot lists candidate groups that include its own allocation column', () => {
    // sanity: 8 third slots, each with 5 candidate source groups
    const thirds = R32.flatMap((m) => [m.home, m.away]).filter((s) => s.kind === 'third')
    expect(thirds).toHaveLength(8)
    thirds.forEach((s) => { if (s.kind === 'third') expect(s.from).toHaveLength(5) })
  })
})

describe('bracket tree', () => {
  it('R16 (8), QF (4), SF (2), Final (1) reference earlier-round winners', () => {
    expect(R16).toHaveLength(8)
    expect(QF).toHaveLength(4)
    expect(SF).toHaveLength(2)
    // R16 fed only by R32 matches
    R16.forEach((e) => e.from.forEach((m) => {
      expect(m).toBeGreaterThanOrEqual(73)
      expect(m).toBeLessThanOrEqual(88)
    }))
    // each round feeds the next
    const r16n = R16.map((e) => e.match)
    QF.forEach((e) => e.from.forEach((m) => expect(r16n).toContain(m)))
    const qfn = QF.map((e) => e.match)
    SF.forEach((e) => e.from.forEach((m) => expect(qfn).toContain(m)))
    const sfn = SF.map((e) => e.match)
    FINAL.from.forEach((m) => expect(sfn).toContain(m))
  })

  it('every R32 winner feeds exactly one R16 match', () => {
    const fed = R16.flatMap((e) => e.from).sort((a, b) => a - b)
    expect(fed).toEqual(Array.from({ length: 16 }, (_, i) => 73 + i))
  })
})
