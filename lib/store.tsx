'use client'

import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { Match } from '@/lib/types'
import { generateFixtures } from '@/lib/data/fixtures'
import { TEAMS } from '@/lib/data/teams'

const STORAGE_KEY = 'wc2026-state'
const TOTAL_MATCHES = 72

export interface AppState {
  matches: Match[]
  liveMode: boolean
  manualBackup: Match[] | null
}

export type Action =
  | { type: 'SET_SCORE'; id: string; homeGoals: number | null; awayGoals: number | null }
  | { type: 'SIMULATE_BY_RANKING' }
  | { type: 'FILL_SCENARIO'; rng?: () => number }
  | { type: 'CLEAR' }
  | { type: 'APPLY_SCENARIO'; scores: Record<string, [number, number]> }
  | { type: 'ENABLE_LIVE' }
  | { type: 'APPLY_LIVE_RESULTS'; results: { a: string; b: string; ga: number; gb: number }[] }
  | { type: 'DISABLE_LIVE' }
  | { type: '__HYDRATE__'; state: AppState }

export function initialState(): AppState {
  return { matches: generateFixtures(), liveMode: false, manualBackup: null }
}

/**
 * Deterministic ranking-based scoreline. Stronger team (lower fifaRank) scores
 * more; closely-ranked teams may draw. No randomness.
 */
export function rankingResult(
  homeId: string,
  awayId: string,
): { homeGoals: number; awayGoals: number } {
  const rankHome = TEAMS[homeId]?.fifaRank ?? 50
  const rankAway = TEAMS[awayId]?.fifaRank ?? 50
  const gap = rankAway - rankHome // positive => home is stronger
  const cap = (n: number) => Math.min(5, n)
  const homeGoals = cap(1 + Math.max(0, Math.round(gap / 18)))
  const awayGoals = cap(1 + Math.max(0, Math.round(-gap / 18)))
  return { homeGoals, awayGoals }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCORE':
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === action.id
            ? { ...m, homeGoals: action.homeGoals, awayGoals: action.awayGoals }
            : m,
        ),
      }
    case 'SIMULATE_BY_RANKING':
      return {
        ...state,
        matches: state.matches.map((m) => {
          const { homeGoals, awayGoals } = rankingResult(m.home, m.away)
          return { ...m, homeGoals, awayGoals }
        }),
      }
    case 'FILL_SCENARIO': {
      const rng = action.rng ?? Math.random
      return {
        ...state,
        matches: state.matches.map((m) => ({
          ...m,
          homeGoals: Math.floor(rng() * 5), // 0-4
          awayGoals: Math.floor(rng() * 5), // 0-4
        })),
      }
    }
    case 'CLEAR':
      return {
        ...state,
        matches: state.matches.map((m) => ({ ...m, homeGoals: null, awayGoals: null })),
      }
    case 'APPLY_SCENARIO':
      // A shared scenario fully defines the results: matches present in
      // `scores` get those values, all others are cleared to null.
      return {
        ...state,
        matches: state.matches.map((m) => {
          const s = action.scores[m.id]
          return s
            ? { ...m, homeGoals: s[0], awayGoals: s[1] }
            : { ...m, homeGoals: null, awayGoals: null }
        }),
      }
    case 'ENABLE_LIVE':
      return {
        ...state,
        liveMode: true,
        manualBackup: state.matches.map((m) => ({ ...m })),
        matches: state.matches.map((m) => ({ ...m, homeGoals: null, awayGoals: null })),
      }
    case 'APPLY_LIVE_RESULTS':
      return {
        ...state,
        matches: state.matches.map((m) => {
          const r = action.results.find(
            (x) =>
              (x.a === m.home && x.b === m.away) || (x.a === m.away && x.b === m.home),
          )
          if (!r) return m
          const homeGoals = m.home === r.a ? r.ga : r.gb
          const awayGoals = m.home === r.a ? r.gb : r.ga
          return { ...m, homeGoals, awayGoals }
        }),
      }
    case 'DISABLE_LIVE':
      return {
        ...state,
        liveMode: false,
        matches:
          state.manualBackup ?? state.matches.map((m) => ({ ...m, homeGoals: null, awayGoals: null })),
        manualBackup: null,
      }
    case '__HYDRATE__':
      return action.state
    default:
      return state
  }
}

/** Stable key for a match independent of home/away orientation or schedule. */
function pairKey(group: string, a: string, b: string): string {
  return `${group}|${[a, b].sort().join('-')}`
}

/**
 * Safely parse a stored payload. Returns null on any parse error or shape
 * mismatch (never throws), so callers can fall back to initialState.
 *
 * Rather than trusting the stored match list (which can be stale after a
 * schedule/calendar change — different pairings, missing kickoff times, etc.),
 * we REBUILD the fixtures from the current data and re-apply any saved scores by
 * team identity. This keeps entered results while always adopting the current
 * schedule. Reloads always start in manual mode.
 */
export function parseStored(raw: string | null): AppState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray(data.matches) ||
      data.matches.length !== TOTAL_MATCHES
    ) {
      return null
    }
    // Index saved scores by team identity (orientation-independent).
    const goalsByKey = new Map<string, Record<string, number>>()
    for (const m of data.matches as Match[]) {
      if (
        m &&
        typeof m.home === 'string' &&
        typeof m.away === 'string' &&
        typeof m.group === 'string' &&
        m.homeGoals != null &&
        m.awayGoals != null
      ) {
        goalsByKey.set(pairKey(m.group, m.home, m.away), {
          [m.home]: m.homeGoals,
          [m.away]: m.awayGoals,
        })
      }
    }
    const matches = generateFixtures().map((f) => {
      const g = goalsByKey.get(pairKey(f.group, f.home, f.away))
      if (!g || g[f.home] == null || g[f.away] == null) return f
      return { ...f, homeGoals: g[f.home], awayGoals: g[f.away] }
    })
    return { matches, liveMode: false, manualBackup: null }
  } catch {
    return null
  }
}

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Hydrate from localStorage on mount; corrupt storage silently falls back.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY))
    if (stored) dispatch({ type: '__HYDRATE__', state: stored })
  }, [])

  // Persist on state change.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      // Persist only matches; live mode is transient and reloads start manual.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ matches: state.matches }))
    } catch {
      // ignore quota / serialization errors
    }
  }, [state.matches])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
