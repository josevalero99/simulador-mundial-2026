import { describe, it, expect } from 'vitest'
import { nextMatchFor } from '@/lib/favorite'
import type { Match } from '@/lib/types'

function mk(id: string, home: string, away: string, kickoff?: string): Match {
  return {
    id,
    group: 'A',
    matchday: 1,
    date: kickoff ?? '',
    kickoff,
    home,
    away,
    homeGoals: null,
    awayGoals: null,
  }
}

const NOW = Date.parse('2026-06-15T00:00:00Z')

describe('nextMatchFor', () => {
  it('picks the earliest future match involving the team', () => {
    const matches: Match[] = [
      mk('past', 'ESP', 'BRA', '2026-06-10T18:00:00Z'), // past
      mk('later', 'ESP', 'GER', '2026-06-25T18:00:00Z'), // future, later
      mk('soon', 'FRA', 'ESP', '2026-06-20T18:00:00Z'), // future, earliest
      mk('other', 'BRA', 'GER', '2026-06-16T18:00:00Z'), // future but no ESP
    ]
    const next = nextMatchFor('ESP', matches, NOW)
    expect(next?.id).toBe('soon')
  })

  it('matches the team whether home or away', () => {
    const matches: Match[] = [mk('m', 'ARG', 'ESP', '2026-06-20T18:00:00Z')]
    expect(nextMatchFor('ESP', matches, NOW)?.id).toBe('m')
    expect(nextMatchFor('ARG', matches, NOW)?.id).toBe('m')
  })

  it('returns null when the team has no future match', () => {
    const matches: Match[] = [
      mk('past', 'ESP', 'BRA', '2026-06-10T18:00:00Z'),
      mk('other', 'FRA', 'GER', '2026-06-20T18:00:00Z'),
    ]
    expect(nextMatchFor('ESP', matches, NOW)).toBeNull()
  })

  it('treats a kickoff exactly at now as not in the future', () => {
    const matches: Match[] = [mk('m', 'ESP', 'BRA', '2026-06-15T00:00:00Z')]
    expect(nextMatchFor('ESP', matches, NOW)).toBeNull()
  })

  it('ignores matches without a kickoff', () => {
    const matches: Match[] = [
      mk('nokick', 'ESP', 'BRA'),
      mk('future', 'ESP', 'GER', '2026-06-20T18:00:00Z'),
    ]
    expect(nextMatchFor('ESP', matches, NOW)?.id).toBe('future')
  })

  it('returns null for an empty list', () => {
    expect(nextMatchFor('ESP', [], NOW)).toBeNull()
  })
})
