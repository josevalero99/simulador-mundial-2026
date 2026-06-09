'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { matchOutcomeProbs, type MarketFn } from '@/lib/engine/montecarlo'

// Model 1X2 probabilities depend only on the (home, away) pair (fifaRank-based),
// so they're stable — compute once per ordered pair and cache.
const MODEL_CACHE = new Map<string, { home: number; draw: number; away: number }>()
function modelProbs(home: string, away: string) {
  const k = `${home}>${away}`
  let v = MODEL_CACHE.get(k)
  if (!v) {
    v = matchOutcomeProbs(home, away, 800)
    MODEL_CACHE.set(k, v)
  }
  return v
}

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

/** Per-outcome: decimal odds, de-vigged implied prob, model prob, and value (model − implied). */
export interface OutcomeCell {
  odds: number
  implied: number
  model: number
  value: number
}
export interface MatchValue {
  home: OutcomeCell
  draw: OutcomeCell
  away: OutcomeCell
}

interface OddsValue {
  configured: boolean
  loading: boolean
  /** 1X2 odds oriented to the given home/away ids, or null if unavailable. */
  oddsForPair: (home: string, away: string) => MatchOdds | null
  /** Odds + implied + model + value per outcome, oriented to home/away, or null. */
  valueForPair: (home: string, away: string) => MatchValue | null
  /** De-vigged market 1X2 probabilities oriented to home/away (for the model blend), or null. */
  marketFn: MarketFn
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
      valueForPair(home, away) {
        const m = byPair.get(pairKey(home, away))
        if (!m) return null
        const oddsH = m.homeId === home ? m.oddsHome : m.oddsAway
        const oddsA = m.homeId === home ? m.oddsAway : m.oddsHome
        const oddsD = m.oddsDraw
        const iH = 1 / oddsH
        const iD = 1 / oddsD
        const iA = 1 / oddsA
        const s = iH + iD + iA // de-vig normaliser
        const mp = modelProbs(home, away)
        return {
          home: { odds: oddsH, implied: iH / s, model: mp.home, value: mp.home - iH / s },
          draw: { odds: oddsD, implied: iD / s, model: mp.draw, value: mp.draw - iD / s },
          away: { odds: oddsA, implied: iA / s, model: mp.away, value: mp.away - iA / s },
        }
      },
      marketFn(home, away) {
        const m = byPair.get(pairKey(home, away))
        if (!m) return null
        const oddsH = m.homeId === home ? m.oddsHome : m.oddsAway
        const oddsA = m.homeId === home ? m.oddsAway : m.oddsHome
        const iH = 1 / oddsH
        const iD = 1 / m.oddsDraw
        const iA = 1 / oddsA
        const s = iH + iD + iA
        return { home: iH / s, draw: iD / s, away: iA / s }
      },
    }
  }, [data, loading])

  return <OddsContext.Provider value={value}>{children}</OddsContext.Provider>
}

export function useOdds(): OddsValue {
  const ctx = useContext(OddsContext)
  if (!ctx) {
    // Safe fallback when used outside a provider (no odds shown).
    return {
      configured: false,
      loading: false,
      oddsForPair: () => null,
      valueForPair: () => null,
      marketFn: () => null,
    }
  }
  return ctx
}
