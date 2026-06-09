'use client'

import { useState } from 'react'
import { StoreProvider, useStore } from '@/lib/store'
import TabNav from '@/components/TabNav'
import GroupStageTab from '@/components/group-stage/GroupStageTab'
import ThirdsTab from '@/components/thirds/ThirdsTab'
import BracketTab from '@/components/bracket/BracketTab'
import ProbabilitiesTab from '@/components/probabilities/ProbabilitiesTab'
import PorraTab from '@/components/porra/PorraTab'

function ActionButtons() {
  const { dispatch } = useStore()
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => dispatch({ type: 'SIMULATE_BY_RANKING' })}
        className="rounded-full bg-[#c6f24e] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#b6e23e]"
      >
        Simular por ranking
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'FILL_SCENARIO' })}
        className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a]"
      >
        Rellenar escenario
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'CLEAR' })}
        className="rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a]"
      >
        Limpiar
      </button>
    </div>
  )
}

function Dashboard() {
  const [active, setActive] = useState(0)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c6f24e]">
            Copa Mundial · 48 selecciones
          </p>
          <div className="mt-3 flex items-center gap-3 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wc2026-logo.jpeg"
              alt="Mundial 2026"
              className="h-12 w-12 shrink-0 rounded-lg sm:h-16 sm:w-16"
            />
            <h1 className="text-4xl font-bold tracking-tight text-[#f5f5f5] sm:text-5xl">
              Simulador Mundial 2026
            </h1>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#8a8a8a] sm:text-base">
            Grupos, calendario y cruces oficiales (sorteo de Washington, 5 dic. 2025). Mete tus
            resultados y el simulador aplica los criterios de desempate de la FIFA en tiempo real.
          </p>
        </div>
        <ActionButtons />
      </header>

      <div className="mt-8">
        <TabNav active={active} onChange={setActive} />
      </div>

      <div className="mt-6">
        {active === 0 && <GroupStageTab />}
        {active === 1 && <ThirdsTab />}
        {active === 2 && <BracketTab />}
        {active === 3 && <ProbabilitiesTab />}
        {active === 4 && <PorraTab />}
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  )
}
