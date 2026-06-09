import { describe, it, expect } from 'vitest'
import { buildBracket, Tie } from '../bracket'
import { R16 } from '@/lib/data/r32'

// 16 synthetic ties for matches 73..88. Each has distinct home/away team ids.
const TIES: Tie[] = Array.from({ length: 16 }, (_, i) => {
  const match = 73 + i
  return { match, home: `T${match}H`, away: `T${match}A` }
})

const alwaysHome = (home: string) => home
const alwaysAway = (_home: string, away: string) => away

describe('buildBracket', () => {
  it('seeds r32 and produces the right round sizes and a champion', () => {
    const state = buildBracket(TIES, alwaysHome)
    expect(state.r32).toHaveLength(16)
    expect(state.r16).toHaveLength(8)
    expect(state.qf).toHaveLength(4)
    expect(state.sf).toHaveLength(2)
    expect(state.final).toBeDefined()
    expect(state.champion).not.toBeNull()
  })

  it('seeds r32 KnockoutMatches from the ties with the picked winner', () => {
    const state = buildBracket(TIES, alwaysHome)
    const m73 = state.r32.find(m => m.match === 73)!
    expect(m73.home).toBe('T73H')
    expect(m73.away).toBe('T73A')
    expect(m73.winner).toBe('T73H')
  })

  it('feeds R16 from R32 winners per the imported edges', () => {
    const state = buildBracket(TIES, alwaysHome)
    // Imported edge: R16 match 89 fed by winners of R32 73 and 75.
    const edge89 = R16.find(e => e.match === 89)!
    expect(edge89.from).toEqual([73, 75])

    const m89 = state.r16.find(m => m.match === 89)!
    const w73 = state.r32.find(m => m.match === 73)!.winner
    const w75 = state.r32.find(m => m.match === 75)!.winner
    expect(m89.home).toBe(w73) // 'T73H'
    expect(m89.away).toBe(w75) // 'T75H'
    expect(m89.winner).toBe(w73) // always-home
  })

  it('a different pickWinner yields a different champion', () => {
    const homeChampion = buildBracket(TIES, alwaysHome).champion
    const awayChampion = buildBracket(TIES, alwaysAway).champion
    expect(homeChampion).toBe('T73H')
    expect(awayChampion).toBe('T87A')
    expect(awayChampion).not.toBe(homeChampion)
  })
})
