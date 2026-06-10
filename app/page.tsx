'use client'

import { useCallback, useEffect, useState } from 'react'
import { Radio } from 'lucide-react'
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
import { FavoriteProvider } from '@/components/favorite/FavoriteProvider'
import FavoritePicker from '@/components/favorite/FavoritePicker'
import BottomTabBar from '@/components/nav/BottomTabBar'
import MobileActionBar from '@/components/nav/MobileActionBar'
import { MobileActionsProvider } from '@/components/actions/MobileActionsContext'
import NextMatchBanner from '@/components/favorite/NextMatchBanner'
import { liveGroupResults, type LiveMatch } from '@/lib/data/liveResults'
import { decodeScenario } from '@/lib/share'

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

  // Apply a shared scenario from the URL (`?e=...`) once on mount. Runs after
  // the store hydrates from localStorage, so a shared link wins. Then strip the
  // query so a refresh doesn't re-apply it.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const e = new URLSearchParams(window.location.search).get('e')
    if (e === null) return
    const scores = decodeScenario(e)
    if (scores) dispatch({ type: 'APPLY_SCENARIO', scores })
    window.history.replaceState({}, '', window.location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main className="mx-auto max-w-7xl px-4 pt-8 pb-32 sm:px-6 sm:py-12">
      <header className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-5xl">
              Mundial 2026
            </h1>
          </div>
        </div>
        <div className="self-end sm:self-auto shrink-0">
          <FavoritePicker />
        </div>
      </header>

      <NextMatchBanner />

      <div className="mt-8">
        <TabNav active={active} onChange={setActive} />
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
      <MobileActionBar />
      <BottomTabBar active={active} onChange={setActive} />
    </main>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <OddsProvider>
        <FavoriteProvider>
          <MobileActionsProvider>
            <Dashboard />
          </MobileActionsProvider>
        </FavoriteProvider>
      </OddsProvider>
    </StoreProvider>
  )
}
