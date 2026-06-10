import { Match, GroupId, StandingRow } from '@/lib/types'
import { TEAMS } from '@/lib/data/teams'
import { GROUPS, GROUP_IDS } from '@/lib/data/groups'
import { generateFixtures } from '@/lib/data/fixtures'
import { rankGroup } from './tiebreakers'
import { resolveR32, buildBracket, Tie } from './bracket'

/** A random number generator returning a float in [0, 1). */
export type Rng = () => number

/** 1X2 outcome distribution (home win / draw / away win). */
export interface Outcome {
  home: number
  draw: number
  away: number
}

/**
 * Bookmaker market-probabilities callback. Given an ordered (home, away) pair it
 * returns the market 1X2 probabilities, or null when no market is available for
 * that match. When present, the model blends it 50/50 with the Elo estimate.
 */
export type MarketFn = (home: string, away: string) => Outcome | null

/** Weight placed on the market probabilities when blending (0..1). */
const BLEND = 0.5

/** FIFA Elo denominator: difference in rating points / 600 sets the curve. */
const ELO_DENOM = 600
/** Base expected goals per side before the Elo supremacy adjustment. */
const BASE_GOALS = 1.35
/** Goals of supremacy per unit of Elo delta (delta = pointsDiff / ELO_DENOM). */
const SUP_PER_D = 1.6
/** Minimum per-side expected goals (keeps Poisson lambdas positive). */
const MIN_LAMBDA = 0.15
/** Cap on the per-match goals sampled per side (keeps scorelines sane). */
const MAX_GOALS = 7
/** Upper goal index used when summing the closed-form Poisson 1X2. */
const SUM_GOALS = 10

/** FIFA rating points for a team id. */
const points = (id: string): number => TEAMS[id].fifaPoints

/**
 * FIFA Elo expected score (win expectancy on a 0..1 scale, draws folded in)
 * for the home team on a neutral venue (no home advantage). Equal points -> 0.5.
 */
export function eloExpectedScore(homeId: string, awayId: string): number {
  const d = (points(homeId) - points(awayId)) / ELO_DENOM
  return 1 / (1 + Math.pow(10, -d))
}

/**
 * Probability the home team beats the away team. Now backed by the FIFA Elo
 * expected score (neutral venue). Used by knockout `pickWinner` (no draws).
 */
export function pHome(homeId: string, awayId: string): number {
  return eloExpectedScore(homeId, awayId)
}

/** Expected goals (Poisson lambdas) for each side, derived from the Elo delta. */
function lambdas(homeId: string, awayId: string): { lh: number; la: number } {
  const d = (points(homeId) - points(awayId)) / ELO_DENOM
  const sup = SUP_PER_D * d
  return {
    lh: Math.max(MIN_LAMBDA, BASE_GOALS + sup / 2),
    la: Math.max(MIN_LAMBDA, BASE_GOALS - sup / 2),
  }
}

/** Poisson probability mass at k for the given mean lambda. */
function poissonPmf(k: number, lambda: number): number {
  let fact = 1
  for (let i = 2; i <= k; i++) fact *= i
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / fact
}

// Cache closed-form Elo 1X2 results per ordered (home, away) pair.
const eloOutcomeCache = new Map<string, Outcome>()

/**
 * Closed-form 1X2 (home/draw/away) probabilities from the two independent
 * Poisson goal distributions implied by the Elo lambdas, summed over scorelines
 * 0..SUM_GOALS. Cached per ordered pair. Probabilities sum to ~1.
 */
export function eloOutcomeProbs(homeId: string, awayId: string): Outcome {
  const key = `${homeId}|${awayId}`
  const cached = eloOutcomeCache.get(key)
  if (cached) return cached

  const { lh, la } = lambdas(homeId, awayId)
  const ph: number[] = []
  const pa: number[] = []
  for (let g = 0; g <= SUM_GOALS; g++) {
    ph[g] = poissonPmf(g, lh)
    pa[g] = poissonPmf(g, la)
  }
  let home = 0
  let draw = 0
  let away = 0
  for (let i = 0; i <= SUM_GOALS; i++) {
    for (let j = 0; j <= SUM_GOALS; j++) {
      const p = ph[i] * pa[j]
      if (i > j) home += p
      else if (i === j) draw += p
      else away += p
    }
  }
  const total = home + draw + away
  const out: Outcome = { home: home / total, draw: draw / total, away: away / total }
  eloOutcomeCache.set(key, out)
  return out
}

/** Blends an Elo outcome with a market outcome 50/50; null market -> pure Elo. */
function blendOutcome(elo: Outcome, market: Outcome | null): Outcome {
  if (!market) return elo
  return {
    home: (1 - BLEND) * elo.home + BLEND * market.home,
    draw: (1 - BLEND) * elo.draw + BLEND * market.draw,
    away: (1 - BLEND) * elo.away + BLEND * market.away,
  }
}

/**
 * Samples a Poisson-distributed integer with the given mean using `rng`
 * (Knuth's algorithm), clamped to MAX_GOALS for stability.
 */
function samplePoisson(mean: number, rng: Rng): number {
  const L = Math.exp(-mean)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return Math.min(k - 1, MAX_GOALS)
}

/**
 * Produces a probabilistic scoreline from the Elo goal model. The stronger side
 * (more FIFA points) gets a higher expected-goals lambda. Group-stage results may
 * be level (a draw); knockout callers must resolve ties themselves (pickWinner).
 *
 * The legacy `fifaRank` parameter is retained for call-site compatibility but is
 * ignored — strength now comes from FIFA Elo points.
 */
export function expectedResult(
  homeId: string,
  awayId: string,
  _fifaRank: ((id: string) => number) | undefined,
  rng: Rng,
): { homeGoals: number; awayGoals: number } {
  const { lh, la } = lambdas(homeId, awayId)
  return {
    homeGoals: samplePoisson(lh, rng),
    awayGoals: samplePoisson(la, rng),
  }
}

/**
 * Deterministic most-likely scoreline under the Elo goal model: the per-side
 * expected goals (lambdas) rounded to the nearest integer. No randomness, no
 * market blend (market influences knockout picks, not this scoreline). Used to
 * fill unplayed group matches when building the single most-likely ranking.
 */
export function mostLikelyScore(
  homeId: string,
  awayId: string,
): { homeGoals: number; awayGoals: number } {
  const { lh, la } = lambdas(homeId, awayId)
  return { homeGoals: Math.round(lh), awayGoals: Math.round(la) }
}

/**
 * Samples a scoreline that honors the (possibly market-blended) 1X2 target.
 * 1. Compute the blended target distribution.
 * 2. Pick an outcome class (home/draw/away) from it via `rng`.
 * 3. Rejection-sample a scoreline from the Elo Poissons until it matches the
 *    class (capped); on exhaustion fall back to a minimal scoreline of the class.
 */
export function sampleScore(
  homeId: string,
  awayId: string,
  market: MarketFn | undefined,
  rng: Rng,
): { homeGoals: number; awayGoals: number } {
  const target = blendOutcome(eloOutcomeProbs(homeId, awayId), market?.(homeId, awayId) ?? null)
  const r = rng()
  // Outcome class: 0 = home, 1 = draw, 2 = away.
  const cls = r < target.home ? 0 : r < target.home + target.draw ? 1 : 2

  const { lh, la } = lambdas(homeId, awayId)
  for (let tries = 0; tries < 30; tries++) {
    const hg = samplePoisson(lh, rng)
    const ag = samplePoisson(la, rng)
    if (cls === 0 && hg > ag) return { homeGoals: hg, awayGoals: ag }
    if (cls === 1 && hg === ag) return { homeGoals: hg, awayGoals: ag }
    if (cls === 2 && hg < ag) return { homeGoals: hg, awayGoals: ag }
  }
  // Fallback: minimal scoreline matching the chosen class.
  if (cls === 0) return { homeGoals: 1, awayGoals: 0 }
  if (cls === 1) return { homeGoals: 0, awayGoals: 0 }
  return { homeGoals: 0, awayGoals: 1 }
}

/**
 * 1X2 (home/draw/away) probabilities for a single match: the closed-form Elo
 * estimate, optionally blended 50/50 with bookmaker market probabilities. The
 * result is deterministic; `n`/`rng` are retained only for signature
 * compatibility with the previous sampling-based implementation.
 */
export function matchOutcomeProbs(
  homeId: string,
  awayId: string,
  _n?: number,
  _rng?: Rng,
  market?: MarketFn,
): Outcome {
  return blendOutcome(eloOutcomeProbs(homeId, awayId), market?.(homeId, awayId) ?? null)
}

export interface SimResult {
  champion: string
  reached: Record<string, Stage>
}

export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'champion'

// Stage ordering used for "furthest reached" comparisons.
const STAGE_ORDER: Stage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'champion']
const stageIndex = (s: Stage) => STAGE_ORDER.indexOf(s)

export interface TeamProbs {
  r32: number
  r16: number
  qf: number
  sf: number
  final: number
  champion: number
}

/**
 * Runs one full tournament from scratch.
 *
 * `base`, when supplied, is a list of group matches whose non-null scores are
 * kept fixed; every match with a null score (and all knockout matches) is
 * simulated via `rng`.
 */
export function simulateOnce(rng: Rng, base?: Match[], market?: MarketFn): SimResult {
  const fifaRank = (id: string): number => TEAMS[id].fifaRank

  // 1. Start from canonical fixtures; copy in any fixed scores from `base`.
  const matches = generateFixtures()
  if (base) {
    const fixed = new Map<string, [number, number]>()
    for (const m of base) {
      if (m.homeGoals !== null && m.awayGoals !== null) {
        fixed.set(m.id, [m.homeGoals, m.awayGoals])
      }
    }
    for (const m of matches) {
      const f = fixed.get(m.id)
      if (f) {
        m.homeGoals = f[0]
        m.awayGoals = f[1]
      }
    }
  }

  // 2. Fill remaining null group matches via the (market-blended) Elo model.
  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) {
      const { homeGoals, awayGoals } = sampleScore(m.home, m.away, market, rng)
      m.homeGoals = homeGoals
      m.awayGoals = awayGoals
    }
  }

  // 3. Rank each group.
  const standingsByGroup = {} as Record<GroupId, StandingRow[]>
  const matchesByGroup = new Map<GroupId, Match[]>()
  for (const g of GROUP_IDS) matchesByGroup.set(g, [])
  for (const m of matches) matchesByGroup.get(m.group)!.push(m)
  for (const g of GROUP_IDS) {
    standingsByGroup[g] = rankGroup(GROUPS[g], matchesByGroup.get(g)!, fifaRank)
  }

  // 4. Resolve R32 and build the knockout bracket.
  const r32: Tie[] = resolveR32(standingsByGroup, fifaRank)
  const pickWinner = (home: string, away: string): string =>
    rng() < eloExpectedScore(home, away) ? home : away
  const bracket = buildBracket(r32, pickWinner)

  // 5. Furthest stage reached per team. Everyone in a group reaches 'group'.
  const reached: Record<string, Stage> = {}
  const setReached = (teamId: string, stage: Stage) => {
    const cur = reached[teamId]
    if (cur === undefined || stageIndex(stage) > stageIndex(cur)) {
      reached[teamId] = stage
    }
  }

  for (const g of GROUP_IDS) {
    for (const id of GROUPS[g]) setReached(id, 'group')
  }
  // Every team that appears in an R32 tie reached at least 'r32'.
  for (const tie of r32) {
    setReached(tie.home, 'r32')
    setReached(tie.away, 'r32')
  }
  // A team that appears as home/away in a later round reached that round.
  const markRound = (
    games: { home: string | null; away: string | null }[],
    stage: Stage,
  ) => {
    for (const m of games) {
      if (m.home !== null) setReached(m.home, stage)
      if (m.away !== null) setReached(m.away, stage)
    }
  }
  markRound(bracket.r16, 'r16')
  markRound(bracket.qf, 'qf')
  markRound(bracket.sf, 'sf')
  markRound([bracket.final], 'final')

  const champion = bracket.champion!
  setReached(champion, 'champion')

  return { champion, reached }
}

/**
 * Runs `n` independent tournament simulations and returns, per team, the
 * cumulative probability of reaching each knockout stage. Reaching a deeper
 * stage implies all shallower ones (a semifinalist counts toward r32/r16/qf).
 */
export function runMonteCarlo(
  n: number,
  rng: Rng = Math.random,
  base?: Match[],
  market?: MarketFn,
): Record<string, TeamProbs> {
  // Cumulative reach counts per team, keyed by the 6 reportable stages.
  const counts: Record<string, { r32: number; r16: number; qf: number; sf: number; final: number; champion: number }> = {}
  const ensure = (id: string) => {
    if (!counts[id]) counts[id] = { r32: 0, r16: 0, qf: 0, sf: 0, final: 0, champion: 0 }
    return counts[id]
  }
  // Pre-register every team so probabilities are 0 (not missing) for early exits.
  for (const g of GROUP_IDS) for (const id of GROUPS[g]) ensure(id)

  const REPORTABLE: Stage[] = ['r32', 'r16', 'qf', 'sf', 'final', 'champion']

  for (let i = 0; i < n; i++) {
    const { reached } = simulateOnce(rng, base, market)
    for (const [id, stage] of Object.entries(reached)) {
      const c = ensure(id)
      const reachedIdx = stageIndex(stage)
      for (const s of REPORTABLE) {
        if (reachedIdx >= stageIndex(s)) c[s as keyof typeof c]++
      }
    }
  }

  const out: Record<string, TeamProbs> = {}
  for (const [id, c] of Object.entries(counts)) {
    out[id] = {
      r32: c.r32 / n,
      r16: c.r16 / n,
      qf: c.qf / n,
      sf: c.sf / n,
      final: c.final / n,
      champion: c.champion / n,
    }
  }
  return out
}
