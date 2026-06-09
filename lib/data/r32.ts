import { GroupId } from '@/lib/types'

// A knockout slot is either a fixed group position (1st/2nd of a group) or a
// third-placed team whose source group is resolved from THIRDS_ALLOCATION.
export type Slot =
  | { kind: 'pos'; rank: 1 | 2; group: GroupId }
  | { kind: 'third'; from: GroupId[] }

export interface R32Match {
  match: number // official FIFA match number (73–88)
  home: Slot
  away: Slot
}

// Official Round-of-32 pairings (2026 FIFA World Cup), matches 73–88.
export const R32: R32Match[] = [
  { match: 73, home: { kind: 'pos', rank: 2, group: 'A' }, away: { kind: 'pos', rank: 2, group: 'B' } },
  { match: 74, home: { kind: 'pos', rank: 1, group: 'C' }, away: { kind: 'pos', rank: 2, group: 'F' } },
  { match: 75, home: { kind: 'pos', rank: 1, group: 'E' }, away: { kind: 'third', from: ['A', 'B', 'C', 'D', 'F'] } },
  { match: 76, home: { kind: 'pos', rank: 1, group: 'F' }, away: { kind: 'pos', rank: 2, group: 'C' } },
  { match: 77, home: { kind: 'pos', rank: 2, group: 'E' }, away: { kind: 'pos', rank: 2, group: 'I' } },
  { match: 78, home: { kind: 'pos', rank: 1, group: 'I' }, away: { kind: 'third', from: ['C', 'D', 'F', 'G', 'H'] } },
  { match: 79, home: { kind: 'pos', rank: 1, group: 'A' }, away: { kind: 'third', from: ['C', 'E', 'F', 'H', 'I'] } },
  { match: 80, home: { kind: 'pos', rank: 1, group: 'L' }, away: { kind: 'third', from: ['E', 'H', 'I', 'J', 'K'] } },
  { match: 81, home: { kind: 'pos', rank: 1, group: 'G' }, away: { kind: 'third', from: ['A', 'E', 'H', 'I', 'J'] } },
  { match: 82, home: { kind: 'pos', rank: 1, group: 'D' }, away: { kind: 'third', from: ['B', 'E', 'F', 'I', 'J'] } },
  { match: 83, home: { kind: 'pos', rank: 1, group: 'H' }, away: { kind: 'pos', rank: 2, group: 'J' } },
  { match: 84, home: { kind: 'pos', rank: 2, group: 'K' }, away: { kind: 'pos', rank: 2, group: 'L' } },
  { match: 85, home: { kind: 'pos', rank: 1, group: 'B' }, away: { kind: 'third', from: ['E', 'F', 'G', 'I', 'J'] } },
  { match: 86, home: { kind: 'pos', rank: 2, group: 'D' }, away: { kind: 'pos', rank: 2, group: 'G' } },
  { match: 87, home: { kind: 'pos', rank: 1, group: 'J' }, away: { kind: 'pos', rank: 2, group: 'H' } },
  { match: 88, home: { kind: 'pos', rank: 1, group: 'K' }, away: { kind: 'third', from: ['D', 'E', 'I', 'J', 'L'] } },
]

// The eight R32 matches whose away slot is a third-placed team. These are the keys
// used by THIRDS_ALLOCATION values.
export const THIRD_SLOT_MATCHES = [75, 78, 79, 80, 81, 82, 85, 88] as const

// A bracket edge: a later match fed by the winners of two earlier matches.
export interface BracketEdge {
  match: number
  from: [number, number]
}

// Official knockout tree (2026 FIFA World Cup).
export const R16: BracketEdge[] = [
  { match: 89, from: [73, 75] },
  { match: 90, from: [74, 77] },
  { match: 91, from: [76, 78] },
  { match: 92, from: [79, 80] },
  { match: 93, from: [83, 84] },
  { match: 94, from: [81, 82] },
  { match: 95, from: [86, 88] },
  { match: 96, from: [85, 87] },
]

export const QF: BracketEdge[] = [
  { match: 97, from: [89, 90] },
  { match: 98, from: [93, 94] },
  { match: 99, from: [91, 92] },
  { match: 100, from: [95, 96] },
]

export const SF: BracketEdge[] = [
  { match: 101, from: [97, 98] },
  { match: 102, from: [99, 100] },
]

export const FINAL: BracketEdge = { match: 104, from: [101, 102] }
