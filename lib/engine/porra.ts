import { Match } from '@/lib/types'
import { PorraEntry } from '@/lib/data/porra'
import { Rng } from './montecarlo'
import { simulateFinalRanking, finalPositions } from './finalRanking'

/** One participant's score for a single final classification. */
export interface PorraScore {
  name: string
  total: number
  teams: { id: string; position: number }[]
}

/**
 * Scores every entry against a final-position map: each entry's total is the
 * sum of its 4 teams' positions (lower positions = better finishes). Returns
 * the entries sorted ascending by total — best (lowest) first.
 */
export function scorePorra(
  positions: Record<string, number>,
  entries: PorraEntry[],
): PorraScore[] {
  const scored: PorraScore[] = entries.map(entry => {
    const teams = entry.teams.map(id => ({ id, position: positions[id] }))
    const total = teams.reduce((s, t) => s + t.position, 0)
    return { name: entry.name, total, teams }
  })
  return scored.sort((a, b) => a.total - b.total)
}

/** Monte Carlo estimate of each participant's chance of winning the porra. */
export interface PorraProb {
  name: string
  winProb: number
  expectedTotal: number
}

/**
 * Runs `n` full-tournament simulations and estimates, per participant, the
 * probability of winning the porra (lowest total) and the expected total.
 * Ties for the win split the credit equally (1/k each). `rng` defaults to
 * Math.random; `base` is forwarded to each simulation. Sorted by winProb desc.
 */
export function runPorraMonteCarlo(
  n: number,
  entries: PorraEntry[],
  base?: Match[],
  rng: Rng = Math.random,
): PorraProb[] {
  const winCredit: Record<string, number> = {}
  const sumTotals: Record<string, number> = {}
  for (const e of entries) {
    winCredit[e.name] = 0
    sumTotals[e.name] = 0
  }

  for (let i = 0; i < n; i++) {
    const ranking = simulateFinalRanking(rng, base)
    const positions = finalPositions(ranking)
    const scored = scorePorra(positions, entries)

    for (const s of scored) sumTotals[s.name] += s.total

    const min = scored[0].total
    const winners = scored.filter(s => s.total === min)
    const credit = 1 / winners.length
    for (const w of winners) winCredit[w.name] += credit
  }

  return entries
    .map(e => ({
      name: e.name,
      winProb: winCredit[e.name] / n,
      expectedTotal: sumTotals[e.name] / n,
    }))
    .sort((a, b) => b.winProb - a.winProb)
}
