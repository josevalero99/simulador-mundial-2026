'use client'

import { useState, useTransition } from 'react'
import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import { runMonteCarlo } from '@/lib/engine/montecarlo'
import type { TeamProbs } from '@/lib/engine/montecarlo'
import Flag from '@/components/ui/Flag'

const N = 2000

/** Formats a probability (0..1) as a percentage with 1 decimal. */
function fmt(p: number): string {
  if (p > 0 && p < 0.001) return '<0.1%'
  return `${(p * 100).toFixed(1)}%`
}

interface BarProps {
  value: number
  color: string
}

function Bar({ value, color }: BarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#262626]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a8a8a]">
        {fmt(value)}
      </span>
    </div>
  )
}

/** Monte Carlo probabilities tab: estimates each team's deep-run chances. */
export default function ProbabilitiesTab() {
  const { state } = useStore()
  const [result, setResult] = useState<Record<string, TeamProbs> | null>(null)
  const [runs, setRuns] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleCalc = () => {
    const base = state.matches
    startTransition(() => {
      const probs = runMonteCarlo(N, undefined, base)
      setResult(probs)
      setRuns(N)
    })
  }

  const rows = result
    ? Object.entries(result).sort((a, b) => b[1].champion - a[1].champion)
    : []

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#f5f5f5]">Probabilidades</h2>
            {state.liveMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-xs font-semibold text-[#22c55e]">
                🔴 En directo
              </span>
            )}
          </div>
          {runs > 0 && (
            <p className="mt-1 text-sm text-[#8a8a8a]">
              {runs.toLocaleString('es')} simulaciones ejecutadas.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCalc}
          disabled={isPending}
          className="shrink-0 rounded-full bg-[#c6f24e] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#b6e23e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Calculando…' : 'Calcular probabilidades'}
        </button>
      </div>

      {!result ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-[#8a8a8a]">
          <p className="text-sm leading-relaxed">
            Pulsa Calcular para estimar las probabilidades mediante simulación Monte Carlo sobre el
            escenario actual.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#262626] bg-[#141414] p-4 sm:p-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                <th className="py-1.5 pl-1 text-left font-medium">Equipo</th>
                <th className="px-3 text-left font-medium">Campeón</th>
                <th className="px-3 text-left font-medium">Final</th>
                <th className="px-3 text-left font-medium">Semis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([id, p]) => {
                const team = TEAMS[id]
                return (
                  <tr key={id} className="border-t border-[#262626]">
                    <td className="py-2 pl-1">
                      <div className="flex items-center gap-2">
                        <Flag teamId={id} className="text-base leading-none" />
                        <span className="truncate text-[#f5f5f5]">{team?.name ?? id}</span>
                      </div>
                    </td>
                    <td className="w-44 px-3">
                      <Bar value={p.champion} color="bg-[#c6f24e]" />
                    </td>
                    <td className="w-44 px-3">
                      <Bar value={p.final} color="bg-[#22c55e]" />
                    </td>
                    <td className="w-44 px-3">
                      <Bar value={p.sf} color="bg-[#22c55e]" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
