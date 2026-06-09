'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { GROUP_IDS } from '@/lib/data/groups'
import GroupCard from './GroupCard'
import FixtureList from './FixtureList'

type ViewMode = 'groups' | 'date'

interface LegendItemProps {
  color: string
  children: React.ReactNode
}

function LegendItem({ color, children }: LegendItemProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a]">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {children}
    </span>
  )
}

/** Group-stage tab: legend, view toggle, and the 12 group cards / by-date list. */
export default function GroupStageTab() {
  const [view, setView] = useState<ViewMode>('groups')
  const { state } = useStore()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <LegendItem color="bg-[#3CAC3B]">1.º y 2.º — clasificados directos</LegendItem>
          <LegendItem color="bg-[#f59e0b]">3.º — a la tabla de terceros</LegendItem>
          <LegendItem color="bg-[#52525b]">4.º — eliminado</LegendItem>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a]">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1c1c1c] text-[10px] font-bold italic text-[#8a8a8a]">
              i
            </span>
            = desempate aplicado
          </span>
        </div>

        <div className="inline-flex shrink-0 rounded-full border border-[#262626] bg-[#141414] p-1">
          <button
            type="button"
            onClick={() => setView('groups')}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              view === 'groups' ? 'bg-[#E8B84B] text-[#0a0a0a]' : 'text-[#8a8a8a] hover:text-[#f5f5f5]',
            ].join(' ')}
          >
            Por grupos
          </button>
          <button
            type="button"
            onClick={() => setView('date')}
            className={[
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              view === 'date' ? 'bg-[#E8B84B] text-[#0a0a0a]' : 'text-[#8a8a8a] hover:text-[#f5f5f5]',
            ].join(' ')}
          >
            Por fecha
          </button>
        </div>
      </div>

      {view === 'groups' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GROUP_IDS.map((g) => (
            <GroupCard key={g} groupId={g} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-4">
          <FixtureList matches={state.matches} showGroup />
        </div>
      )}
    </div>
  )
}
