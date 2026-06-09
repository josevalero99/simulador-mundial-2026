import type { Match } from '@/lib/types'

/**
 * The team's earliest match with a `kickoff` strictly in the future
 * (kickoff ms > nowMs), or null if the team has no upcoming match.
 * Pure: depends only on its arguments.
 */
export function nextMatchFor(teamId: string, matches: Match[], nowMs: number): Match | null {
  let best: Match | null = null
  let bestMs = Infinity
  for (const m of matches) {
    if (m.home !== teamId && m.away !== teamId) continue
    if (!m.kickoff) continue
    const ms = Date.parse(m.kickoff)
    if (Number.isNaN(ms)) continue
    if (ms <= nowMs) continue
    if (ms < bestMs) {
      bestMs = ms
      best = m
    }
  }
  return best
}
