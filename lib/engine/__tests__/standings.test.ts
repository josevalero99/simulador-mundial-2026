import { describe, it, expect } from 'vitest'
import { computeStandings } from '../standings'
import { Match } from '@/lib/types'

const m = (home: string, away: string, hg: number | null, ag: number | null): Match =>
  ({ id: `${home}${away}`, group: 'A', matchday: 1, date: '', home, away, homeGoals: hg, awayGoals: ag })

describe('computeStandings', () => {
  it('win=3, draw=1, loss=0 with goal accounting', () => {
    const rows = computeStandings(['X', 'Y', 'Z'], [m('X', 'Y', 2, 0), m('Y', 'Z', 1, 1)])
    const X = rows.find(r => r.teamId === 'X')!, Y = rows.find(r => r.teamId === 'Y')!, Z = rows.find(r => r.teamId === 'Z')!
    expect(X.points).toBe(3); expect(X.won).toBe(1); expect(X.gf).toBe(2); expect(X.gd).toBe(2)
    expect(Y.points).toBe(1); expect(Y.played).toBe(2); expect(Y.gf).toBe(1); expect(Y.ga).toBe(3)
    expect(Z.points).toBe(1)
  })
  it('ignores matches with null scores', () => {
    const rows = computeStandings(['X', 'Y'], [m('X', 'Y', null, null)])
    expect(rows.every(r => r.played === 0 && r.points === 0)).toBe(true)
  })
  it('returns one row per teamId in input order', () => {
    const rows = computeStandings(['A', 'B', 'C'], [])
    expect(rows.map(r => r.teamId)).toEqual(['A', 'B', 'C'])
  })
  it('ignores matches whose teams are not in teamIds', () => {
    const rows = computeStandings(['X', 'Y'], [m('X', 'Q', 5, 0), m('Q', 'R', 1, 1)])
    expect(rows.find(r => r.teamId === 'X')!.played).toBe(0)
    expect(rows.every(r => r.played === 0)).toBe(true)
  })
})
