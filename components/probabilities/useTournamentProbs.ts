'use client'

import { useCallback, useState, useTransition } from 'react'
import { useStore } from '@/lib/store'
import { useOdds } from '@/components/odds/OddsProvider'
import { runMonteCarlo, type TeamProbs } from '@/lib/engine/montecarlo'

export interface TournamentProbs {
  probs: Record<string, TeamProbs> | null
  computing: boolean
  /** Dispara el Monte Carlo sobre el escenario actual. */
  compute: () => void
}

/**
 * Monte Carlo del torneo, compartido. No se ejecuta solo: el consumidor llama
 * a `compute()` (botón en Probabilidades, en montaje en el Comparador).
 */
export function useTournamentProbs(n: number): TournamentProbs {
  const { state } = useStore()
  const { marketFn } = useOdds()
  const [probs, setProbs] = useState<Record<string, TeamProbs> | null>(null)
  const [computing, startTransition] = useTransition()

  const compute = useCallback(() => {
    const base = state.matches
    startTransition(() => setProbs(runMonteCarlo(n, undefined, base, marketFn)))
  }, [state.matches, marketFn, n])

  return { probs, computing, compute }
}
