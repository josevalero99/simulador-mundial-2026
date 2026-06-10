'use client'

import { useState } from 'react'
import { Trophy, ChevronDown, ChevronRight } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import type { PorraEntry } from '@/lib/data/porra'
import type { PorraProb } from '@/lib/engine/porra'
import Flag from '@/components/ui/Flag'

const teamName = (id: string) => TEAMS[id]?.name ?? id

function fmtProb(p: number): string {
  if (p > 0 && p < 0.001) return '<0.1%'
  return `${(p * 100).toFixed(1)}%`
}

interface Props {
  result: PorraProb[]
  byName: Map<string, PorraEntry>
  /** Position of each team in the single most-likely final ranking (1..48). */
  positions: Record<string, number>
}

/** Results table (Monte Carlo) with an expandable per-team breakdown row. */
export default function PorraResults({ result, byName, positions }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const leaderName = result.length > 0 ? result[0].name : null

  const toggle = (name: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4 sm:p-6">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
            <th className="py-1.5 pl-2 text-left font-medium">#</th>
            <th className="px-3 text-left font-medium">Participante</th>
            <th className="px-3 text-left font-medium">Selecciones</th>
            <th className="px-3 text-left font-medium">Prob. victoria</th>
            <th className="px-3 text-right font-medium">Total esperado</th>
            <th className="px-2" />
          </tr>
        </thead>
        <tbody>
          {result.map((prob, i) => {
            const entry = byName.get(prob.name)
            const teams = entry?.teams ?? []
            const isLeader = prob.name === leaderName
            const isOpen = open.has(prob.name)
            const mostLikelyTotal = teams.reduce((s, id) => s + (positions[id] ?? 0), 0)

            const mainRow = (
              <tr
                key={prob.name}
                onClick={() => toggle(prob.name)}
                className={[
                  'cursor-pointer border-t border-white/10',
                  isLeader ? 'bg-[#E8B84B]/5' : '',
                ].join(' ')}
              >
                <td className="py-2.5 pl-2 align-middle">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center text-sm font-bold tabular-nums text-[#8a8a8a]">
                    {isLeader ? (
                      <Trophy size={16} strokeWidth={2} color="#E8B84B" aria-label="Líder" />
                    ) : (
                      i + 1
                    )}
                  </span>
                </td>
                <td className="px-3 align-middle">
                  <span className={`font-bold ${isLeader ? 'text-[#E8B84B]' : 'text-[#f5f5f5]'}`}>
                    {prob.name}
                  </span>
                </td>
                <td className="px-3 align-middle">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {teams.map((id, idx) => (
                      <span
                        key={`${id}-${idx}`}
                        title={teamName(id)}
                        className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-0.5 text-xs text-[#f5f5f5]"
                      >
                        <Flag teamId={id} className="text-sm leading-none" />
                        {id}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="w-44 px-3 align-middle">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#262626]">
                      <div
                        className="h-full rounded-full bg-[#E8B84B]"
                        style={{ width: `${Math.max(0, Math.min(1, prob.winProb)) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a8a8a]">
                      {fmtProb(prob.winProb)}
                    </span>
                  </div>
                </td>
                <td className="px-3 text-right align-middle">
                  <span className="text-sm font-medium tabular-nums text-[#f5f5f5]">
                    {prob.expectedTotal.toFixed(1)}
                  </span>
                </td>
                <td className="px-2 align-middle text-[#8a8a8a]">
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </td>
              </tr>
            )

            const detailRow = isOpen ? (
              <tr key={`${prob.name}-desglose`} className="bg-black/20">
                <td />
                <td colSpan={5} className="px-3 pb-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                    Posición en el cuadro más probable
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#f5f5f5]">
                    {teams.map((id, idx) => (
                      <span key={`${id}-${idx}`} className="inline-flex items-center gap-1.5">
                        <Flag teamId={id} className="text-sm leading-none" />
                        {teamName(id)}
                        <span className="font-bold tabular-nums text-[#E8B84B]">
                          {positions[id] ?? '—'}
                        </span>
                      </span>
                    ))}
                    <span className="text-[#8a8a8a]">
                      = <span className="font-bold tabular-nums text-[#f5f5f5]">{mostLikelyTotal}</span>
                    </span>
                  </div>
                </td>
              </tr>
            ) : null

            return [mainRow, detailRow]
          })}
        </tbody>
      </table>
    </div>
  )
}
