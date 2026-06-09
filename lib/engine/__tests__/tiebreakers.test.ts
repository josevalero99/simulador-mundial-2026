import { describe, it, expect } from 'vitest'
import { rankGroup } from '../tiebreakers'
import { Match } from '@/lib/types'

let _id = 0
const m = (home: string, away: string, hg: number, ag: number): Match =>
  ({ id: `m${_id++}`, group: 'A', matchday: 1, date: '', home, away, homeGoals: hg, awayGoals: ag })

// Deterministic fifaRank factory: lower number = better. Unique per team.
const fifa = (ranks: Record<string, number>) => (teamId: string): number => ranks[teamId] ?? 999

describe('rankGroup', () => {
  it('1. pure points ordering (no ties) → no tiebreakApplied', () => {
    // P beats Q & R; Q beats R. P=6, Q=3, R=0.
    const matches = [m('P', 'Q', 1, 0), m('P', 'R', 1, 0), m('Q', 'R', 1, 0)]
    const rows = rankGroup(['P', 'Q', 'R'], matches, fifa({ P: 1, Q: 2, R: 3 }))
    expect(rows.map(r => r.teamId)).toEqual(['P', 'Q', 'R'])
    expect(rows.map(r => r.rank)).toEqual([1, 2, 3])
    expect(rows.every(r => r.tiebreakApplied === undefined)).toBe(true)
  })

  it('2. equal points separated by overall goal difference → "Diferencia de goles"', () => {
    // A: beat C 3-0, draw B 0-0 → 4pts gd+3 gf3
    // B: beat C 1-0, draw A 0-0 → 4pts gd+1 gf1
    // C: 0pts
    const matches = [m('A', 'C', 3, 0), m('A', 'B', 0, 0), m('B', 'C', 1, 0)]
    const rows = rankGroup(['A', 'B', 'C'], matches, fifa({ A: 1, B: 2, C: 3 }))
    expect(rows.map(r => r.teamId)).toEqual(['A', 'B', 'C'])
    expect(rows[0].tiebreakApplied).toBe('Diferencia de goles')
    expect(rows[1].tiebreakApplied).toBeUndefined() // B vs C: points differ
    expect(rows[2].tiebreakApplied).toBeUndefined()
  })

  it('3. equal points AND equal GD separated by goals scored → "Goles a favor"', () => {
    // A: beat C 2-1, draw B 0-0 → 4pts gd+1 gf2
    // B: beat C 1-0, draw A 0-0 → 4pts gd+1 gf1
    const matches = [m('A', 'C', 2, 1), m('A', 'B', 0, 0), m('B', 'C', 1, 0)]
    const rows = rankGroup(['A', 'B', 'C'], matches, fifa({ A: 1, B: 2, C: 3 }))
    expect(rows.map(r => r.teamId)).toEqual(['A', 'B', 'C'])
    expect(rows[0].gd).toBe(1)
    expect(rows[1].gd).toBe(1)
    expect(rows[0].tiebreakApplied).toBe('Goles a favor')
    expect(rows[1].tiebreakApplied).toBeUndefined()
  })

  it('4. two teams fully equal on pts/gd/gf, head-to-head decides → "Enfrentamiento directo"', () => {
    // A beat B 2-0; A lost to D 0-2; B beat C 2-0.
    // A: pts3 gf2 ga2 gd0 ; B: pts3 gf2 ga2 gd0 ; D: pts3 gd+2 ; C: pts0
    const matches = [m('A', 'B', 2, 0), m('D', 'A', 2, 0), m('B', 'C', 2, 0)]
    const rows = rankGroup(['A', 'B', 'C', 'D'], matches, fifa({ A: 1, B: 2, C: 3, D: 4 }))
    expect(rows.map(r => r.teamId)).toEqual(['D', 'A', 'B', 'C'])
    expect(rows.map(r => r.rank)).toEqual([1, 2, 3, 4])
    // D vs A: both 3 pts, gd differs (+2 vs 0)
    expect(rows[0].tiebreakApplied).toBe('Diferencia de goles')
    // A vs B: pts/gd/gf equal, A beat B head-to-head
    expect(rows[1].tiebreakApplied).toBe('Enfrentamiento directo')
    // B vs C: points differ
    expect(rows[2].tiebreakApplied).toBeUndefined()
    expect(rows[3].tiebreakApplied).toBeUndefined()
  })

  it('5. three teams equal on pts/gd/gf, resolved by the head-to-head mini-table', () => {
    // h2h among A,B,C: A beat B 1-0, A beat C 1-0, B beat C 1-0  → A>B>C in mini-table
    // Equalize overall via D,E so A,B,C all end pts6 gd0 gf2 ga2:
    //   A loses to D 0-1 and to E 0-1
    //   B beats D 1-0, loses to E 0-1
    //   C beats D 1-0, beats E 1-0
    // E ends pts6 gd+1 (best of the 6-pt cluster); D ends pts3.
    const matches = [
      m('A', 'B', 1, 0), m('A', 'C', 1, 0), m('B', 'C', 1, 0),
      m('D', 'A', 1, 0), m('E', 'A', 1, 0),
      m('B', 'D', 1, 0), m('E', 'B', 1, 0),
      m('C', 'D', 1, 0), m('C', 'E', 1, 0),
    ]
    const rows = rankGroup(['A', 'B', 'C', 'D', 'E'], matches, fifa({ A: 1, B: 2, C: 3, D: 4, E: 5 }))
    expect(rows.map(r => r.teamId)).toEqual(['E', 'A', 'B', 'C', 'D'])
    // Confirm the three are genuinely equal on the overall criteria
    const A = rows.find(r => r.teamId === 'A')!, B = rows.find(r => r.teamId === 'B')!, C = rows.find(r => r.teamId === 'C')!
    expect([A.points, A.gd, A.gf]).toEqual([6, 0, 2])
    expect([B.points, B.gd, B.gf]).toEqual([6, 0, 2])
    expect([C.points, C.gd, C.gf]).toEqual([6, 0, 2])
    // E vs A: both 6 pts, gd differs (+1 vs 0)
    expect(rows[0].tiebreakApplied).toBe('Diferencia de goles')
    // A vs B and B vs C separated by head-to-head mini-table
    expect(rows[1].tiebreakApplied).toBe('Enfrentamiento directo')
    expect(rows[2].tiebreakApplied).toBe('Enfrentamiento directo')
    // C vs D: points differ (6 vs 3)
    expect(rows[3].tiebreakApplied).toBeUndefined()
    expect(rows[4].tiebreakApplied).toBeUndefined()
  })

  it('6. everything identical (all draws) → resolved by "Ranking FIFA"', () => {
    // A,B,C all draw each other 0-0 → identical pts2 gd0 gf0, h2h all equal.
    const matches = [m('A', 'B', 0, 0), m('A', 'C', 0, 0), m('B', 'C', 0, 0)]
    // Lower fifaRank = better → A best, then B, then C.
    const rows = rankGroup(['A', 'B', 'C'], matches, fifa({ A: 5, B: 10, C: 20 }))
    expect(rows.map(r => r.teamId)).toEqual(['A', 'B', 'C'])
    expect(rows[0].tiebreakApplied).toBe('Ranking FIFA')
    expect(rows[1].tiebreakApplied).toBe('Ranking FIFA')
    expect(rows[2].tiebreakApplied).toBeUndefined()
  })
})
