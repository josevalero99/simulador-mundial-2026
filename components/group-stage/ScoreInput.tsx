'use client'

import { useStore } from '@/lib/store'
import type { Match } from '@/lib/types'

interface ScoreInputProps {
  match: Match
}

/** Parse raw input into a non-negative integer, or null for empty/invalid. */
function parseScore(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  const i = Math.floor(n)
  if (i < 0) return null
  return i
}

/** Two small score chips (home / away) with a dash between them. */
export default function ScoreInput({ match }: ScoreInputProps) {
  const { dispatch } = useStore()

  const setHome = (raw: string) =>
    dispatch({
      type: 'SET_SCORE',
      id: match.id,
      homeGoals: parseScore(raw),
      awayGoals: match.awayGoals,
    })

  const setAway = (raw: string) =>
    dispatch({
      type: 'SET_SCORE',
      id: match.id,
      homeGoals: match.homeGoals,
      awayGoals: parseScore(raw),
    })

  const chip =
    'h-9 w-9 rounded-lg bg-[#1c1c1c] text-center font-mono text-base font-bold text-[#f5f5f5] outline-none transition-colors focus:ring-2 focus:ring-[#c6f24e] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        aria-label="Goles local"
        value={match.homeGoals ?? ''}
        onChange={(e) => setHome(e.target.value)}
        className={chip}
      />
      <span className="text-[#5a5a5a]">–</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        aria-label="Goles visitante"
        value={match.awayGoals ?? ''}
        onChange={(e) => setAway(e.target.value)}
        className={chip}
      />
    </div>
  )
}
