'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface OddsMatch {
  homeId: string
  awayId: string
  commence_time?: string
  oddsHome: number
  oddsDraw: number
  oddsAway: number
}

interface OddsApiResponse {
  configured?: boolean
  fetchedAt?: string
  matches?: OddsMatch[]
  outrights?: { teamId: string; odds: number }[]
  error?: string
}

export interface MatchOdds {
  home: number
  draw: number
  away: number
}

interface OddsValue {
  configured: boolean
  loading: boolean
  /** 1X2 odds oriented to the given home/away ids, or null if unavailable. */
  oddsForPair: (home: string, away: string) => MatchOdds | null
}

const OddsContext = createContext<OddsValue | null>(null)
const pairKey = (a: string, b: string) => [a, b].sort().join('|')

export function OddsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OddsApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/cuotas')
      .then((r) => r.json())
      .then((j: OddsApiResponse) => {
        if (active) setData(j)
      })
      .catch(() => {
        if (active) setData({ configured: false })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<OddsValue>(() => {
    const byPair = new Map<string, OddsMatch>()
    for (const m of data?.matches ?? []) byPair.set(pairKey(m.homeId, m.awayId), m)
    return {
      configured: Boolean(data?.configured),
      loading,
      oddsForPair(home, away) {
        const m = byPair.get(pairKey(home, away))
        if (!m) return null
        // Orient the stored odds to the requested home/away.
        return m.homeId === home
          ? { home: m.oddsHome, draw: m.oddsDraw, away: m.oddsAway }
          : { home: m.oddsAway, draw: m.oddsDraw, away: m.oddsHome }
      },
    }
  }, [data, loading])

  return <OddsContext.Provider value={value}>{children}</OddsContext.Provider>
}

export function useOdds(): OddsValue {
  const ctx = useContext(OddsContext)
  if (!ctx) {
    // Safe fallback when used outside a provider (no odds shown).
    return { configured: false, loading: false, oddsForPair: () => null }
  }
  return ctx
}
