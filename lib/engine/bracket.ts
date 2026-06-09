import { GroupId, StandingRow } from '@/lib/types'
import { THIRDS_ALLOCATION } from '@/lib/data/thirdsAllocation'

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
