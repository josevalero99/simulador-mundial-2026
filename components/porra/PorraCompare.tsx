'use client'

import { Trophy } from 'lucide-react'
import { scorePorra } from '@/lib/engine/porra'
import type { Porra } from '@/lib/data/porra'

interface Props {
  porras: Porra[]
  activeId: string
  /** Position of each team in the single most-likely final ranking (1..48). */
  positions: Record<string, number>
  onSelect: (id: string) => void
}

/** Compact overview: the current leader of every porra by most-likely total. */
export default function PorraCompare({ porras, activeId, positions, onSelect }: Props) {
  const rows = porras.map(p => {
    const scored = scorePorra(positions, p.entries)
    const leader = scored[0]
    return { porra: p, leaderName: leader?.name ?? '—', leaderTotal: leader?.total ?? 0 }
  })

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4 sm:p-6">
      <p className="mb-3 text-sm text-[#8a8a8a]">
        Líder actual de cada porra según el cuadro más probable (menor total).
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
            <th className="py-1.5 pl-2 text-left font-medium">Porra</th>
            <th className="px-3 text-left font-medium">Participantes</th>
            <th className="px-3 text-left font-medium">Líder actual</th>
            <th className="px-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ porra, leaderName, leaderTotal }) => (
            <tr
              key={porra.id}
              onClick={() => onSelect(porra.id)}
              className={[
                'cursor-pointer border-t border-white/10 hover:bg-white/5',
                porra.id === activeId ? 'bg-[#E8B84B]/5' : '',
              ].join(' ')}
            >
              <td className="py-2.5 pl-2 align-middle font-bold text-[#f5f5f5]">{porra.name}</td>
              <td className="px-3 align-middle tabular-nums text-[#8a8a8a]">{porra.entries.length}</td>
              <td className="px-3 align-middle">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#E8B84B]">
                  <Trophy size={14} strokeWidth={2} aria-hidden="true" />
                  {leaderName}
                </span>
              </td>
              <td className="px-3 text-right align-middle tabular-nums text-[#f5f5f5]">{leaderTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
