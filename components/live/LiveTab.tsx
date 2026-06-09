'use client'

import { useStore } from '@/lib/store'
import { TEAMS } from '@/lib/data/teams'
import type { LiveMatch } from '@/lib/data/liveResults'
import Flag from '@/components/ui/Flag'
import Pill from '@/components/ui/Pill'

interface LiveTabProps {
  liveData: { matches: LiveMatch[]; fetchedAt: string } | null
  liveError?: string | null
  onRefresh: () => void
}

/** Display name for a live-match side: real team name when known, else the raw placeholder. */
function sideName(id: string | null, name: string): string {
  return id ? (TEAMS[id]?.name ?? name) : name
}

interface LiveMatchRowProps {
  match: LiveMatch
}

function LiveMatchRow({ match }: LiveMatchRowProps) {
  const { id1, id2, name1, name2, homeGoals, awayGoals, finished, date } = match
  const left = sideName(id1, name1)
  const right = sideName(id2, name2)

  return (
    <div className="flex items-center gap-3 border-t border-[#262626] py-2.5 text-sm first:border-t-0">
      <span className="w-28 shrink-0 text-xs text-[#8a8a8a]">{date}</span>

      <div className="flex flex-1 items-center justify-end gap-2 text-right">
        <span className="font-medium text-[#f5f5f5]">{left}</span>
        {id1 && <Flag teamId={id1} className="text-base leading-none" />}
      </div>

      <div className="flex w-20 shrink-0 items-center justify-center">
        {finished ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#1c1c1c] px-1.5 text-sm font-bold tabular-nums text-[#f5f5f5]">
              {homeGoals}
            </span>
            <span className="text-[#5a5a5a]">-</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[#1c1c1c] px-1.5 text-sm font-bold tabular-nums text-[#f5f5f5]">
              {awayGoals}
            </span>
          </span>
        ) : (
          <span className="text-xs font-medium text-[#8a8a8a]">vs</span>
        )}
      </div>

      <div className="flex flex-1 items-center gap-2">
        {id2 && <Flag teamId={id2} className="text-base leading-none" />}
        <span className="font-medium text-[#f5f5f5]">{right}</span>
      </div>

      <div className="w-20 shrink-0 text-right">
        {finished ? (
          <Pill color="green" className="px-2 py-0.5">
            Final
          </Pill>
        ) : (
          <Pill color="dark" className="px-2 py-0.5">
            Programado
          </Pill>
        )}
      </div>
    </div>
  )
}

/** Groups matches by `round` preserving first-seen order. */
function groupByRound(matches: LiveMatch[]): { round: string; matches: LiveMatch[] }[] {
  const order: string[] = []
  const byRound = new Map<string, LiveMatch[]>()
  for (const m of matches) {
    const key = m.round || 'Otros'
    if (!byRound.has(key)) {
      byRound.set(key, [])
      order.push(key)
    }
    byRound.get(key)!.push(m)
  }
  return order.map(round => ({
    round,
    matches: [...byRound.get(round)!].sort((a, b) => a.date.localeCompare(b.date)),
  }))
}

/** Live results tab: live-mode toggle + the real fixture list grouped by round. */
export default function LiveTab({ liveData, liveError, onRefresh }: LiveTabProps) {
  const { state, dispatch } = useStore()
  const live = state.liveMode

  const toggle = () => dispatch({ type: live ? 'DISABLE_LIVE' : 'ENABLE_LIVE' })

  const lastUpdate = liveData
    ? new Date(liveData.fetchedAt).toLocaleTimeString('es-ES')
    : null

  const anyFinished = liveData ? liveData.matches.some(m => m.finished) : false
  const rounds = liveData ? groupByRound(liveData.matches) : []

  return (
    <div>
      {/* Header: explanation + toggle */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#262626] bg-[#141414] p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#f5f5f5]">En directo</h2>
            {live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-xs font-semibold text-[#22c55e]">
                🔴 EN DIRECTO
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-[#8a8a8a]">
            {live
              ? 'Modo en directo activo: los resultados reales se aplican a toda la app. La porra se actualiza con cada partido.'
              : 'Activa el modo en directo para que los resultados reales rellenen grupos, eliminatorias y la porra automáticamente.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            role="switch"
            aria-checked={live}
            onClick={toggle}
            className={[
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              live
                ? 'border-[#22c55e] bg-[#22c55e] text-[#0a0a0a]'
                : 'border-[#262626] bg-[#0a0a0a] text-[#f5f5f5] hover:border-[#3a3a3a]',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-2.5 w-2.5 rounded-full',
                live ? 'bg-[#0a0a0a]' : 'bg-[#8a8a8a]',
              ].join(' ')}
            />
            Modo en directo {live ? 'activo' : 'desactivado'}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-full border border-[#262626] bg-[#0a0a0a] px-3 py-1.5 text-xs font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a]"
            >
              Actualizar
            </button>
            {lastUpdate && (
              <span className="text-xs text-[#8a8a8a]">
                Última actualización: {lastUpdate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notices */}
      {liveError && (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b]">
          <span className="mr-1">⚠</span>
          No se pudieron cargar los resultados (se reintenta automáticamente).
        </div>
      )}

      {!liveData ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-sm text-[#8a8a8a]">
          Cargando resultados…
        </div>
      ) : (
        <>
          {!anyFinished && (
            <div className="mt-4 rounded-xl border border-[#262626] bg-[#141414] p-3 text-sm text-[#8a8a8a]">
              Aún no hay resultados — el Mundial arranca el 11 de junio.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-6">
            {rounds.map(({ round, matches }) => (
              <section
                key={round}
                className="overflow-x-auto rounded-2xl border border-[#262626] bg-[#141414] p-4 sm:p-5"
              >
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#c6f24e]">
                  {round}
                </h3>
                <div>
                  {matches.map((m, i) => (
                    <LiveMatchRow key={`${round}-${i}`} match={m} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
