import { GroupId, StandingRow } from '@/lib/types'
import { THIRDS_ALLOCATION } from '@/lib/data/thirdsAllocation'
import { R32, Slot } from '@/lib/data/r32'
import { rankThirds } from './bestThirds'

/**
 * Maps each third-slot R32 match number to the group whose 3rd-placed team plays
 * there, for a given set of 8 qualifying groups. The combo is sorted & joined into
 * the THIRDS_ALLOCATION key.
 * @throws if no allocation exists for the combination (e.g. wrong number of groups).
 */
export function allocateThirds(qualifyingGroups: GroupId[]): Record<number, GroupId> {
  const key = [...qualifyingGroups].sort().join('')
  const allocation = THIRDS_ALLOCATION[key]
  if (!allocation) throw new Error('No allocation for combination: ' + key)
  return allocation
}

export interface Tie {
  match: number
  home: string
  away: string
}

/**
 * Resolves every R32 pairing into concrete team ids.
 * - 'pos' slot -> the team in that group whose rank matches the slot.
 * - 'third' slot -> rank the 12 thirds, take the 8 qualifying groups, allocate them
 *   to the third-slot match numbers, then read the source group's rank-3 team.
 * Returns 16 ties ordered by match number (73..88).
 */
export function resolveR32(
  standingsByGroup: Record<GroupId, StandingRow[]>,
  fifaRank: (teamId: string) => number,
): Tie[] {
  const qualifyingGroups = rankThirds(standingsByGroup, fifaRank)
    .filter(t => t.qualified)
    .map(t => t.group)
  const allocation = allocateThirds(qualifyingGroups)

  const teamFor = (match: number, slot: Slot): string => {
    if (slot.kind === 'pos') {
      const r = standingsByGroup[slot.group].find(row => row.rank === slot.rank)
      if (!r) throw new Error(`No rank-${slot.rank} team in group ${slot.group}`)
      return r.teamId
    }
    const sourceGroup = allocation[match]
    if (!sourceGroup) throw new Error(`No third-place allocation for match ${match}`)
    const r = standingsByGroup[sourceGroup].find(row => row.rank === 3)
    if (!r) throw new Error(`No rank-3 team in group ${sourceGroup}`)
    return r.teamId
  }

  return R32.map(({ match, home, away }) => ({
    match,
    home: teamFor(match, home),
    away: teamFor(match, away),
  }))
}
