import { GroupId } from '@/lib/types'
export const GROUPS: Record<GroupId, string[]> = {
  A: ['MEX','KOR','RSA','CZE'],
  B: ['CAN','SUI','QAT','BIH'],
  C: ['BRA','MAR','SCO','HAI'],
  D: ['USA','AUS','PAR','TUR'],
  E: ['GER','ECU','CIV','CUW'],
  F: ['NED','JPN','TUN','SWE'],
  G: ['BEL','IRN','EGY','NZL'],
  H: ['ESP','URU','KSA','CPV'],
  I: ['FRA','SEN','NOR','IRQ'],
  J: ['ARG','AUT','ALG','JOR'],
  K: ['POR','COL','UZB','COD'],
  L: ['ENG','CRO','PAN','GHA'],
}
export const GROUP_IDS: GroupId[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

/** Devuelve el grupo (A..L) al que pertenece un equipo, o undefined. */
export function groupOf(teamId: string): GroupId | undefined {
  for (const g of GROUP_IDS) {
    if (GROUPS[g].includes(teamId)) return g
  }
  return undefined
}
