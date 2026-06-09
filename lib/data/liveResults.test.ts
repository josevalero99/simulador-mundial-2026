import { describe, it, expect } from 'vitest'
import { TEAMS } from '@/lib/data/teams'
import {
  NAME_TO_ID,
  parseOpenfootball,
  liveGroupResults,
  toKickoffIso,
  type LiveMatch,
} from './liveResults'

describe('toKickoffIso', () => {
  it('converts venue local time + offset to absolute UTC', () => {
    // 13:00 at UTC-6 == 19:00 UTC
    expect(toKickoffIso('2026-06-11', '13:00 UTC-6')).toBe('2026-06-11T19:00:00.000Z')
    // 20:00 at UTC-4 == 00:00 UTC next day
    expect(toKickoffIso('2026-06-11', '20:00 UTC-4')).toBe('2026-06-12T00:00:00.000Z')
  })
  it('returns null on malformed input', () => {
    expect(toKickoffIso('2026-06-11', 'tbd')).toBeNull()
    expect(toKickoffIso('', '13:00 UTC-6')).toBeNull()
  })
})

describe('NAME_TO_ID', () => {
  it('has exactly 48 entries', () => {
    expect(Object.keys(NAME_TO_ID)).toHaveLength(48)
  })

  it('every value is a valid TEAMS id', () => {
    for (const id of Object.values(NAME_TO_ID)) {
      expect(TEAMS[id], `id ${id} should exist in TEAMS`).toBeDefined()
    }
  })

  it('all 48 ids are distinct', () => {
    const ids = Object.values(NAME_TO_ID)
    expect(new Set(ids).size).toBe(48)
  })
})

const FIXTURE = {
  name: 'World Cup 2026',
  matches: [
    {
      round: 'Matchday 1',
      date: '2026-06-11',
      time: '13:00 UTC-6',
      team1: 'Mexico',
      team2: 'South Africa',
      group: 'Group A',
      ground: 'Mexico City',
      score: { ht: [1, 0], ft: [3, 1] },
    },
    {
      round: 'Matchday 1',
      date: '2026-06-11',
      time: '16:00 UTC-6',
      team1: 'Canada',
      team2: 'Switzerland',
      group: 'Group B',
      ground: 'Toronto',
    },
    {
      round: 'Round of 32',
      date: '2026-06-29',
      time: '12:00 UTC-6',
      team1: '1A',
      team2: '3A/B/C/D/F',
      ground: 'Los Angeles',
    },
  ],
}

describe('parseOpenfootball', () => {
  it('returns 3 LiveMatch for the 3-match fixture', () => {
    const out = parseOpenfootball(FIXTURE)
    expect(out).toHaveLength(3)
  })

  it('parses the scored group match correctly', () => {
    const out = parseOpenfootball(FIXTURE)
    const m = out[0]
    expect(m.finished).toBe(true)
    expect(m.group).toBe('A')
    expect(m.id1).toBe('MEX')
    expect(m.id2).toBe('RSA')
    expect(m.homeGoals).toBe(3)
    expect(m.awayGoals).toBe(1)
  })

  it('parses the unscored group match as not finished', () => {
    const out = parseOpenfootball(FIXTURE)
    const m = out[1]
    expect(m.finished).toBe(false)
    expect(m.group).toBe('B')
    expect(m.id1).toBe('CAN')
    expect(m.id2).toBe('SUI')
    expect(m.homeGoals).toBe(null)
    expect(m.awayGoals).toBe(null)
  })

  it('parses the knockout placeholder match with null group and ids', () => {
    const out = parseOpenfootball(FIXTURE)
    const m = out[2]
    expect(m.group).toBe(null)
    expect(m.id1).toBe(null)
    expect(m.id2).toBe(null)
    expect(m.name1).toBe('1A')
    expect(m.name2).toBe('3A/B/C/D/F')
    expect(m.finished).toBe(false)
  })

  it('returns [] for bad shapes and never throws', () => {
    expect(parseOpenfootball(null)).toEqual([])
    expect(parseOpenfootball(undefined)).toEqual([])
    expect(parseOpenfootball({})).toEqual([])
    expect(parseOpenfootball({ matches: 'nope' })).toEqual([])
    expect(parseOpenfootball(42)).toEqual([])
  })
})

describe('liveGroupResults', () => {
  it('returns only finished group matches with mapped ids, oriented {a,b,ga,gb}', () => {
    const matches = parseOpenfootball(FIXTURE)
    const results = liveGroupResults(matches)
    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({ a: 'MEX', b: 'RSA', ga: 3, gb: 1, group: 'A' })
  })

  it('excludes finished group matches with an unknown id', () => {
    const matches: LiveMatch[] = [
      {
        round: 'Matchday 1',
        date: '2026-06-11',
        kickoff: null,
        group: 'A',
        name1: 'Mexico',
        name2: 'Unknownland',
        id1: 'MEX',
        id2: null,
        homeGoals: 2,
        awayGoals: 0,
        finished: true,
      },
    ]
    expect(liveGroupResults(matches)).toHaveLength(0)
  })

  it('excludes non-group (knockout) finished matches', () => {
    const matches: LiveMatch[] = [
      {
        round: 'Round of 32',
        date: '2026-06-29',
        kickoff: null,
        group: null,
        name1: 'Mexico',
        name2: 'Canada',
        id1: 'MEX',
        id2: 'CAN',
        homeGoals: 1,
        awayGoals: 0,
        finished: true,
      },
    ]
    expect(liveGroupResults(matches)).toHaveLength(0)
  })
})
