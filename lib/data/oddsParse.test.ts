import { describe, it, expect } from 'vitest'
import { normalizeH2H, normalizeOutrights } from './oddsParse'

describe('normalizeH2H', () => {
  it('averages each outcome price across bookmakers and resolves ids', () => {
    const raw = [
      {
        home_team: 'Brazil',
        away_team: 'South Korea',
        commence_time: '2026-06-20T18:00:00Z',
        bookmakers: [
          {
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Brazil', price: 1.5 },
                  { name: 'Draw', price: 4.0 },
                  { name: 'South Korea', price: 6.0 },
                ],
              },
            ],
          },
          {
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Brazil', price: 1.7 },
                  { name: 'Draw', price: 4.4 },
                  { name: 'South Korea', price: 6.4 },
                ],
              },
            ],
          },
        ],
      },
    ]
    const out = normalizeH2H(raw)
    expect(out).toHaveLength(1)
    expect(out[0].homeId).toBe('BRA')
    expect(out[0].awayId).toBe('KOR')
    expect(out[0].commence_time).toBe('2026-06-20T18:00:00Z')
    expect(out[0].oddsHome).toBeCloseTo(1.6, 5)
    expect(out[0].oddsDraw).toBeCloseTo(4.2, 5)
    expect(out[0].oddsAway).toBeCloseTo(6.2, 5)
  })

  it('skips events with an unresolved team', () => {
    const raw = [
      {
        home_team: 'Brazil',
        away_team: 'Atlantis',
        bookmakers: [
          {
            markets: [
              { key: 'h2h', outcomes: [{ name: 'Brazil', price: 1.5 }, { name: 'Draw', price: 4 }] },
            ],
          },
        ],
      },
    ]
    expect(normalizeH2H(raw)).toHaveLength(0)
  })

  it('returns empty array for non-array input', () => {
    expect(normalizeH2H(null)).toEqual([])
    expect(normalizeH2H(undefined)).toEqual([])
  })
})

describe('normalizeOutrights', () => {
  it('averages each team price across bookmakers and events', () => {
    const raw = [
      {
        bookmakers: [
          {
            markets: [
              {
                key: 'outrights',
                outcomes: [
                  { name: 'Brazil', price: 5.0 },
                  { name: 'Argentina', price: 6.0 },
                ],
              },
            ],
          },
          {
            markets: [
              {
                key: 'outrights',
                outcomes: [
                  { name: 'Brazil', price: 5.4 },
                  { name: 'Argentina', price: 6.4 },
                ],
              },
            ],
          },
        ],
      },
    ]
    const out = normalizeOutrights(raw)
    const bra = out.find((o) => o.teamId === 'BRA')
    const arg = out.find((o) => o.teamId === 'ARG')
    expect(bra?.odds).toBeCloseTo(5.2, 5)
    expect(arg?.odds).toBeCloseTo(6.2, 5)
  })

  it('skips unresolved teams and handles non-array input', () => {
    expect(normalizeOutrights(null)).toEqual([])
    const raw = [
      {
        bookmakers: [
          { markets: [{ key: 'outrights', outcomes: [{ name: 'Atlantis', price: 2 }] }] },
        ],
      },
    ]
    expect(normalizeOutrights(raw)).toEqual([])
  })
})
