import { oddsNameToId } from './oddsTeams'

// --- The Odds API response shapes (subset we consume) ---
interface OddsOutcome {
  name: string
  price: number
}
interface OddsMarket {
  key: string
  outcomes?: OddsOutcome[]
}
interface OddsBookmaker {
  markets?: OddsMarket[]
}
export interface OddsEvent {
  home_team?: string
  away_team?: string
  commence_time?: string
  bookmakers?: OddsBookmaker[]
}

export interface H2HMatch {
  homeId: string
  awayId: string
  commence_time: string | null
  oddsHome: number
  oddsDraw: number
  oddsAway: number
}

export interface Outright {
  teamId: string
  odds: number
}

/** Mean of a numeric array, or null if empty. */
function mean(xs: number[]): number | null {
  if (xs.length === 0) return null
  return xs.reduce((s, x) => s + x, 0) / xs.length
}

/**
 * Normalize h2h events: for each event average each outcome's decimal price
 * across all bookmakers. Outcomes are the two team names plus "Draw".
 * Skips events where either team can't be resolved or odds are missing.
 */
export function normalizeH2H(raw: unknown): H2HMatch[] {
  if (!Array.isArray(raw)) return []
  const out: H2HMatch[] = []
  for (const ev of raw as OddsEvent[]) {
    const homeId = ev?.home_team ? oddsNameToId(ev.home_team) : null
    const awayId = ev?.away_team ? oddsNameToId(ev.away_team) : null
    if (!homeId || !awayId) continue

    const homePrices: number[] = []
    const drawPrices: number[] = []
    const awayPrices: number[] = []
    for (const bm of ev.bookmakers ?? []) {
      for (const mk of bm.markets ?? []) {
        if (mk.key !== 'h2h') continue
        for (const oc of mk.outcomes ?? []) {
          if (typeof oc?.price !== 'number') continue
          const id = oddsNameToId(oc.name)
          if (id === homeId) homePrices.push(oc.price)
          else if (id === awayId) awayPrices.push(oc.price)
          else if (oc.name && oc.name.trim().toLowerCase() === 'draw') drawPrices.push(oc.price)
        }
      }
    }
    const oddsHome = mean(homePrices)
    const oddsDraw = mean(drawPrices)
    const oddsAway = mean(awayPrices)
    if (oddsHome === null || oddsDraw === null || oddsAway === null) continue

    out.push({
      homeId,
      awayId,
      commence_time: ev.commence_time ?? null,
      oddsHome,
      oddsDraw,
      oddsAway,
    })
  }
  return out
}

/**
 * Normalize outright (winner) events: average each team's decimal price across
 * all bookmakers and across all events. Skips unresolved team names.
 */
export function normalizeOutrights(raw: unknown): Outright[] {
  if (!Array.isArray(raw)) return []
  const prices = new Map<string, number[]>()
  for (const ev of raw as OddsEvent[]) {
    for (const bm of ev.bookmakers ?? []) {
      for (const mk of bm.markets ?? []) {
        if (mk.key !== 'outrights') continue
        for (const oc of mk.outcomes ?? []) {
          if (typeof oc?.price !== 'number') continue
          const id = oddsNameToId(oc.name)
          if (!id) continue
          const arr = prices.get(id) ?? []
          arr.push(oc.price)
          prices.set(id, arr)
        }
      }
    }
  }
  const out: Outright[] = []
  for (const [teamId, xs] of prices) {
    const odds = mean(xs)
    if (odds !== null) out.push({ teamId, odds })
  }
  return out
}
