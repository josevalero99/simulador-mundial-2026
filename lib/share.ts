import { Match } from '@/lib/types'

type Scenario = Record<string, [number, number]>

/** base64 -> base64url (URL-safe, unpadded). */
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** base64url -> base64 (re-add padding). */
function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4
  return pad ? b64 + '='.repeat(4 - pad) : b64
}

/**
 * Compact, URL-safe encoding of the SCORED matches: only matches with both
 * goals non-null are included, as `{ [matchId]: [homeGoals, awayGoals] }`.
 * Empty scenario -> ''.
 */
export function encodeScenario(matches: Match[]): string {
  const scenario: Scenario = {}
  for (const m of matches) {
    if (m.homeGoals != null && m.awayGoals != null) {
      scenario[m.id] = [m.homeGoals, m.awayGoals]
    }
  }
  if (Object.keys(scenario).length === 0) return ''
  return toBase64Url(btoa(JSON.stringify(scenario)))
}

/**
 * Reverse of {@link encodeScenario}. Returns the decoded scenario, `{}` for the
 * empty string, or `null` on any error or shape mismatch. Never throws.
 * Each value must be a 2-element array of non-negative integers.
 */
export function decodeScenario(s: string): Scenario | null {
  if (s === '') return {}
  try {
    const json = atob(fromBase64Url(s))
    const data: unknown = JSON.parse(json)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
    const out: Scenario = {}
    for (const [id, value] of Object.entries(data as Record<string, unknown>)) {
      if (
        !Array.isArray(value) ||
        value.length !== 2 ||
        !value.every(
          (n) => typeof n === 'number' && Number.isInteger(n) && n >= 0,
        )
      ) {
        return null
      }
      out[id] = [value[0] as number, value[1] as number]
    }
    return out
  } catch {
    return null
  }
}
