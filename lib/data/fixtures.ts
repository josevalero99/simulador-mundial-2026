import { GROUP_SCHEDULE } from './schedule'
import { GROUP_IDS } from './groups'
import { Match, Matchday, GroupId } from '@/lib/types'

/**
 * Builds the 72 group-stage fixtures from the real 2026 calendar. Within each
 * group the six matches are ordered by kickoff and chunked into three matchdays
 * (two matches each). Each match carries its real `kickoff` (UTC ISO) and date.
 */
export function generateFixtures(): Match[] {
  const out: Match[] = []
  for (const g of GROUP_IDS) {
    const list = GROUP_SCHEDULE.filter((s) => s.group === g).sort((a, b) =>
      a.kickoff < b.kickoff ? -1 : a.kickoff > b.kickoff ? 1 : 0,
    )
    list.forEach((s, i) => {
      const matchday = (Math.floor(i / 2) + 1) as Matchday
      out.push({
        id: `${g}-${matchday}-${i % 2}`,
        group: g as GroupId,
        matchday,
        date: s.date,
        kickoff: s.kickoff,
        home: s.home,
        away: s.away,
        homeGoals: null,
        awayGoals: null,
      })
    })
  }
  return out
}
