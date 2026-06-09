'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Radio, Wand2, Dices, Eraser, ChevronDown } from 'lucide-react'
import { StoreProvider, useStore } from '@/lib/store'
import TabNav from '@/components/TabNav'
import GroupStageTab from '@/components/group-stage/GroupStageTab'
import ThirdsTab from '@/components/thirds/ThirdsTab'
import BracketTab from '@/components/bracket/BracketTab'
import ProbabilitiesTab from '@/components/probabilities/ProbabilitiesTab'
import PorraTab from '@/components/porra/PorraTab'
import LiveTab from '@/components/live/LiveTab'
import CuotasTab from '@/components/cuotas/CuotasTab'
import NoticiasTab from '@/components/noticias/NoticiasTab'
import { OddsProvider } from '@/components/odds/OddsProvider'
import { liveGroupResults, type LiveMatch } from '@/lib/data/liveResults'

function ActionsMenu() {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const item = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onClick()
        setOpen(false)
      }}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-[#1c1c1c]"
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-[#E8B84B] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c]"
      >
        Acciones
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#262626] bg-[#141414] p-1 shadow-xl"
        >
          {item(
            <Wand2 size={16} strokeWidth={2} aria-hidden="true" />,
            'Simular por ranking',
            () => dispatch({ type: 'SIMULATE_BY_RANKING' }),
          )}
          {item(
            <Dices size={16} strokeWidth={2} aria-hidden="true" />,
            'Rellenar escenario',
            () => dispatch({ type: 'FILL_SCENARIO' }),
          )}
          {item(
            <Eraser size={16} strokeWidth={2} aria-hidden="true" />,
            'Limpiar',
            () => dispatch({ type: 'CLEAR' }),
          )}
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  const [active, setActive] = useState(0)
  const { state, dispatch } = useStore()
  const [liveData, setLiveData] = useState<{ matches: LiveMatch[]; fetchedAt: string } | null>(
    null,
  )
  const [liveError, setLiveError] = useState<string | null>(null)

  // Fetch real results from the cached API route.
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('/api/resultados')
      const json = (await res.json()) as {
        matches: LiveMatch[]
        fetchedAt: string
        error?: string
      }
      if (json.error) setLiveError(json.error)
      else setLiveError(null)
      setLiveData({ matches: json.matches ?? [], fetchedAt: json.fetchedAt })
    } catch {
      setLiveError('fetch-failed')
    }
  }, [])

  // Poll once on mount and every 60s.
  useEffect(() => {
    void fetchLive()
    const id = setInterval(() => void fetchLive(), 60_000)
    return () => clearInterval(id)
  }, [fetchLive])

  // When live mode is on, push real group results into the store so groups,
  // terceros, probabilidades and porra all reflect reality.
  useEffect(() => {
    if (!state.liveMode || !liveData) return
    dispatch({ type: 'APPLY_LIVE_RESULTS', results: liveGroupResults(liveData.matches) })
  }, [state.liveMode, liveData, dispatch])

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <div className="max-w-3xl">
          {state.liveMode && (
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E61D25]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E61D25]">
                <Radio size={12} strokeWidth={2} aria-hidden="true" /> En directo
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 sm:gap-4">
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
      </header>

      <div className="mt-8 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <TabNav active={active} onChange={setActive} />
        </div>
        <ActionsMenu />
      </div>

      <div className="mt-6">
        {active === 0 && <GroupStageTab />}
        {active === 1 && <ThirdsTab />}
        {active === 2 && <BracketTab />}
        {active === 3 && <ProbabilitiesTab />}
        {active === 4 && <PorraTab />}
        {active === 5 && (
          <LiveTab liveData={liveData} liveError={liveError} onRefresh={fetchLive} />
        )}
        {active === 6 && <CuotasTab />}
        {active === 7 && <NoticiasTab />}
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <OddsProvider>
        <Dashboard />
      </OddsProvider>
    </StoreProvider>
  )
}
