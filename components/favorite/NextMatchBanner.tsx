'use client'

import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import Flag from '@/components/ui/Flag'
import { dayES, timeES } from '@/lib/format'
import { nextMatchFor } from '@/lib/favorite'
import { useFavorite } from './FavoriteProvider'

/** "faltan 2d 5h 30m" from a positive millisecond diff. */
function formatCountdown(diffMs: number): string {
  const total = Math.max(0, Math.floor(diffMs / 60000)) // whole minutes
  const d = Math.floor(total / (60 * 24))
  const h = Math.floor((total % (60 * 24)) / 60)
  const m = total % 60
  return `faltan ${d}d ${h}h ${m}m`
}

/** Full-width glass card with the favorite's next match + a live countdown. */
export default function NextMatchBanner() {
  const { favorite } = useFavorite()
  const { state } = useStore()
  // Re-render every 60s to refresh the countdown.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!favorite) return null
  const match = nextMatchFor(favorite, state.matches, now)
  if (!match) return null

  const rivalId = match.home === favorite ? match.away : match.home
  const fav = TEAMS[favorite]
  const rival = TEAMS[rivalId]
  const day = dayES(match.kickoff)
  const time = timeES(match.kickoff)
  const diff = match.kickoff ? Date.parse(match.kickoff) - now : 0

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#E8B84B]/25 bg-[#E8B84B]/[0.06] backdrop-blur-xl px-4 py-3">
      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#E8B84B]">
        <CalendarClock size={15} strokeWidth={2} aria-hidden="true" />
        Próximo partido
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#f5f5f5]">
        <Flag teamId={favorite} className="text-base leading-none" />
        <span className="truncate font-semibold">{fav?.name ?? favorite}</span>
        <span className="text-[#8a8a8a]">vs</span>
        <Flag teamId={rivalId} className="text-base leading-none" />
        <span className="truncate">{rival?.name ?? rivalId}</span>
      </div>
      {(day || time) && (
        <div className="text-xs tabular-nums text-[#8a8a8a]">
          {[day, time].filter(Boolean).join(' · ')}
        </div>
      )}
      <div className="tabular-nums rounded-full bg-[#E8B84B]/15 px-2.5 py-1 text-xs font-semibold text-[#E8B84B]">
        {formatCountdown(diff)}
      </div>
    </div>
  )
}
