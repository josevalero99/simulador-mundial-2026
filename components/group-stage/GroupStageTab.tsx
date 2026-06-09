'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
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

/** Group-stage tab: view toggle on top, the 12 group cards / by-date list, legend at the bottom. */
export default function GroupStageTab() {
  const [view, setView] = useState<ViewMode>('groups')
  const { state } = useStore()

  return (
    <div>
      <div className="flex justify-end">
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
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GROUP_IDS.map((g) => (
            <GroupCard key={g} groupId={g} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-[#262626] bg-[#141414] p-4">
          <FixtureList matches={state.matches} showGroup />
        </div>
      )}

      {/* Leyenda al final */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#262626] pt-4">
        <LegendItem color="bg-[#3CAC3B]">1.º y 2.º — clasificados directos</LegendItem>
        <LegendItem color="bg-[#f59e0b]">3.º — a la tabla de terceros</LegendItem>
        <LegendItem color="bg-[#52525b]">4.º — eliminado</LegendItem>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a]">
          <Info size={13} strokeWidth={2} aria-hidden="true" />= desempate aplicado
        </span>
      </div>
    </div>
  )
}
