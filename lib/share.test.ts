import { describe, it, expect } from 'vitest'
import { encodeScenario, decodeScenario } from './share'
import { generateFixtures } from '@/lib/data/fixtures'
import type { Match } from '@/lib/types'

/** Apply a SET_SCORE-style score to a fixtures list (immutably). */
function withScore(matches: Match[], id: string, h: number, a: number): Match[] {
  return matches.map((m) => (m.id === id ? { ...m, homeGoals: h, awayGoals: a } : m))
}

describe('encodeScenario / decodeScenario', () => {
  it('round-trips a scenario built from generateFixtures with a few scores', () => {
    let matches = generateFixtures()
    const [a, b, c] = matches
    matches = withScore(matches, a.id, 2, 1)
    matches = withScore(matches, b.id, 0, 0)
    matches = withScore(matches, c.id, 3, 2)

    const encoded = encodeScenario(matches)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
    // URL-safe: no +, /, or = padding
    expect(encoded).not.toMatch(/[+/=]/)

    const decoded = decodeScenario(encoded)
    expect(decoded).toEqual({
      [a.id]: [2, 1],
      [b.id]: [0, 0],
      [c.id]: [3, 2],
    })
  })

  it('only includes matches with both goals non-null', () => {
    let matches = generateFixtures()
    matches = withScore(matches, matches[0].id, 1, 0)
    // leave one half-filled (should be excluded)
    matches = matches.map((m, i) => (i === 1 ? { ...m, homeGoals: 2, awayGoals: null } : m))

    const decoded = decodeScenario(encodeScenario(matches))
    expect(decoded).toEqual({ [matches[0].id]: [1, 0] })
  })

  it('encodes an empty (all-null) scenario as the empty string', () => {
    expect(encodeScenario(generateFixtures())).toBe('')
  })

  it("decodes '' to an empty object (documented choice: empty input -> {})", () => {
    expect(decodeScenario('')).toEqual({})
  })

  it('returns null for non-base64 garbage', () => {
    expect(decodeScenario('!!notbase64')).toBe(null)
  })

  it('returns null for valid base64 of a wrong-shaped object', () => {
    // base64url of {"x":1}
    const wrong = btoa(JSON.stringify({ x: 1 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(decodeScenario(wrong)).toBe(null)
  })

  it('returns null when a value is not a 2-number array', () => {
    const bad = btoa(JSON.stringify({ 'A-1-0': [1] }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(decodeScenario(bad)).toBe(null)
  })

  it('returns null when a value contains a negative or non-integer goal', () => {
    const neg = btoa(JSON.stringify({ 'A-1-0': [-1, 2] }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(decodeScenario(neg)).toBe(null)

    const frac = btoa(JSON.stringify({ 'A-1-0': [1.5, 2] }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(decodeScenario(frac)).toBe(null)
  })

  it('never throws on arbitrary input', () => {
    expect(() => decodeScenario('%%%')).not.toThrow()
    expect(() => decodeScenario('-_-_-_')).not.toThrow()
  })
})
