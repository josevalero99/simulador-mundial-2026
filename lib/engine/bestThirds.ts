import { GroupId, StandingRow } from '@/lib/types'

export interface ThirdPlace {
  group: GroupId
  row: StandingRow
  qualified: boolean
}

/**
 * Ranks the 12 third-placed teams (one per group) to decide which 8 advance.
 * Order: points desc, gd desc, gf desc, then fifaRank asc.
 * The first 8 are marked qualified. Returns all 12 in ranked order.
 */
export function rankThirds(
  standingsByGroup: Record<GroupId, StandingRow[]>,
  fifaRank: (teamId: string) => number,
): ThirdPlace[] {
  const thirds: { group: GroupId; row: StandingRow }[] = []
  for (const group of Object.keys(standingsByGroup) as GroupId[]) {
    const row = standingsByGroup[group].find(r => r.rank === 3)
    if (row) thirds.push({ group, row })
  }

  thirds.sort((a, b) => {
    if (b.row.points !== a.row.points) return b.row.points - a.row.points
    if (b.row.gd !== a.row.gd) return b.row.gd - a.row.gd
    if (b.row.gf !== a.row.gf) return b.row.gf - a.row.gf
    return fifaRank(a.row.teamId) - fifaRank(b.row.teamId)
  })

  return thirds.map((t, i) => ({ group: t.group, row: t.row, qualified: i < 8 }))
}
