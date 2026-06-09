import { GROUPS, GROUP_IDS } from './groups'
import { Match, Matchday } from '@/lib/types'
const PAIRS: [number,number][][] = [[[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]]]
const MD_DATES = ['2026-06-11','2026-06-18','2026-06-24']
export function generateFixtures(): Match[] {
  const out: Match[] = []
  for (const g of GROUP_IDS) {
    const ids = GROUPS[g]
    PAIRS.forEach((md, i) => {
      const matchday = (i + 1) as Matchday
      md.forEach(([h, a], j) => {
        out.push({ id:`${g}-${matchday}-${j}`, group:g, matchday, date:MD_DATES[i],
          home:ids[h], away:ids[a], homeGoals:null, awayGoals:null })
      })
    })
  }
  return out
}
