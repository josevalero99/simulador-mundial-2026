import { Match, StandingRow } from '@/lib/types'

/**
 * Computes raw standings (no tiebreakers applied; rank is left at 0).
 * - One row per teamId, in the same order as the teamIds input.
 * - Only matches with both homeGoals and awayGoals non-null are counted.
 * - Matches involving a team not present in teamIds are ignored (defensive).
 */
export function computeStandings(teamIds: string[], matches: Match[]): StandingRow[] {
  const rows = new Map<string, StandingRow>()
  for (const teamId of teamIds) {
    rows.set(teamId, {
      teamId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      rank: 0,
    })
  }

  for (const match of matches) {
    if (match.homeGoals === null || match.awayGoals === null) continue
    const home = rows.get(match.home)
    const away = rows.get(match.away)
    if (!home || !away) continue

    home.played++
    away.played++
    home.gf += match.homeGoals
    home.ga += match.awayGoals
    away.gf += match.awayGoals
    away.ga += match.homeGoals

    if (match.homeGoals > match.awayGoals) {
      home.won++
      home.points += 3
      away.lost++
    } else if (match.homeGoals < match.awayGoals) {
      away.won++
      away.points += 3
      home.lost++
    } else {
      home.drawn++
      away.drawn++
      home.points += 1
      away.points += 1
    }
  }

  for (const row of rows.values()) {
    row.gd = row.gf - row.ga
  }

  return teamIds.map(id => rows.get(id)!)
}
