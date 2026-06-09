'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { TrendingUp, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import { runMonteCarlo, matchOutcomeProbs } from '@/lib/engine/montecarlo'
import Flag from '@/components/ui/Flag'

// Monte Carlo runs for the outright (champion%) table.
const OUTRIGHT_N = 2000
// Samples per match for the 1X2 model probabilities (kept modest for perf).
const MATCH_N = 600
// Cap on how many matches we model per load (next N upcoming).
const MATCH_CAP = 16
// A positive value of >= 2pp gets a "VALOR" badge.
const VALUE_BADGE_PP = 2

interface H2HMatch {
  homeId: string
  awayId: string
  commence_time: string | null
  oddsHome: number
  oddsDraw: number
  oddsAway: number
}
interface Outright {
  teamId: string
  odds: number
}
interface CuotasResponse {
  configured: boolean
  fetchedAt?: string
  error?: string
  matches?: H2HMatch[]
  outrights?: Outright[]
}

function fmtPct(p: number): string {
  return `${(p * 100).toFixed(1)}%`
}
function fmtOdds(o: number): string {
  return o.toFixed(2)
}
/** Formats a value (model% − implied%, expressed 0..1) with sign in pp. */
function fmtValue(v: number): string {
  const pp = v * 100
  const sign = pp >= 0 ? '+' : '−'
  return `${sign}${Math.abs(pp).toFixed(1)} pp`
}

/** Small value cell: shows the signed model-vs-market edge, green if positive. */
function ValueTag({ value }: { value: number }) {
  const positive = value > 0
  const strong = value >= VALUE_BADGE_PP / 100
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`tabular-nums text-xs font-semibold ${
          positive ? 'text-[#3CAC3B]' : 'text-[#5a5a5a]'
        }`}
      >
        {fmtValue(value)}
      </span>
      {strong && (
        <span className="rounded bg-[#3CAC3B]/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3CAC3B]">
          Valor
        </span>
      )}
    </span>
  )
}

interface OutrightRow {
  teamId: string
  odds: number
  implied: number
  model: number
  value: number
}

interface MatchRow {
  homeId: string
  awayId: string
  commence_time: string | null
  cells: {
    odds: number
    implied: number
    model: number
    value: number
  }[] // [home, draw, away]
}

/** Cuotas tab: compares The Odds API bookmaker odds against our Monte Carlo model. */
export default function CuotasTab() {
  const [data, setData] = useState<CuotasResponse | null>(null)
  const [outrightRows, setOutrightRows] = useState<OutrightRow[] | null>(null)
  const [matchRows, setMatchRows] = useState<MatchRow[] | null>(null)
  const [capped, setCapped] = useState(false)
  const [isPending, startTransition] = useTransition()

  const compute = useCallback((res: CuotasResponse) => {
    if (!res.configured || res.error) {
      setOutrightRows(null)
      setMatchRows(null)
      return
    }
    startTransition(() => {
      // --- Outright: model champion% per team ---
      const model = runMonteCarlo(OUTRIGHT_N)
      const outrights = (res.outrights ?? []).filter((o) => TEAMS[o.teamId])
      // De-vig: normalize implied probabilities across the listed teams.
      const impliedRaw = outrights.map((o) => 1 / o.odds)
      const impliedSum = impliedRaw.reduce((s, x) => s + x, 0) || 1
      const oRows: OutrightRow[] = outrights.map((o, i) => {
        const implied = impliedRaw[i] / impliedSum
        const m = model[o.teamId]?.champion ?? 0
        return { teamId: o.teamId, odds: o.odds, implied, model: m, value: m - implied }
      })
      oRows.sort((a, b) => b.model - a.model)
      setOutrightRows(oRows)

      // --- Per-match 1X2 ---
      const allMatches = (res.matches ?? []).filter(
        (mm) => TEAMS[mm.homeId] && TEAMS[mm.awayId],
      )
      // Show the next upcoming matches first (by commence_time), capped.
      const sorted = [...allMatches].sort((a, b) => {
        const ta = a.commence_time ? Date.parse(a.commence_time) : Infinity
        const tb = b.commence_time ? Date.parse(b.commence_time) : Infinity
        return ta - tb
      })
      const limited = sorted.slice(0, MATCH_CAP)
      setCapped(sorted.length > MATCH_CAP)

      const mRows: MatchRow[] = limited.map((mm) => {
        const p = matchOutcomeProbs(mm.homeId, mm.awayId, MATCH_N)
        const odds = [mm.oddsHome, mm.oddsDraw, mm.oddsAway]
        const impliedRaw3 = odds.map((o) => 1 / o)
        const sum3 = impliedRaw3.reduce((s, x) => s + x, 0) || 1
        const modelArr = [p.home, p.draw, p.away]
        const cells = odds.map((o, i) => {
          const implied = impliedRaw3[i] / sum3
          return { odds: o, implied, model: modelArr[i], value: modelArr[i] - implied }
        })
        return {
          homeId: mm.homeId,
          awayId: mm.awayId,
          commence_time: mm.commence_time,
          cells,
        }
      })
      setMatchRows(mRows)
    })
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cuotas')
      const json = (await res.json()) as CuotasResponse
      setData(json)
      compute(json)
    } catch {
      setData({ configured: true, error: 'fetch-failed' })
    }
  }, [compute])

  // Auto-load on mount.
  useEffect(() => {
    void load()
  }, [load])

  const fetchedLabel = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div>
      {/* Responsible-gambling note */}
      <div className="rounded-2xl border border-[#262626] bg-[#141414] p-4 text-xs leading-relaxed text-[#8a8a8a]">
        <span className="font-semibold text-[#E8B84B]">Información orientativa.</span> Las cuotas y
        el modelo son probabilidades, no predicciones. El modelo es sencillo (ranking FIFA) y no
        supera al mercado. Juega con responsabilidad · 18+.
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} strokeWidth={2} className="text-[#E8B84B]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#f5f5f5]">Cuotas vs. modelo</h2>
          </div>
          <p className="mt-1 text-xs text-[#5a5a5a]">
            {fetchedLabel ? `Actualizado a las ${fetchedLabel}. ` : ''}Las cuotas se cachean ~1 h.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={isPending}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#E8B84B] px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className={isPending ? 'animate-spin' : ''}
          />
          {isPending ? 'Cargando…' : data ? 'Actualizar cuotas' : 'Cargar cuotas'}
        </button>
      </div>

      {/* Not configured */}
      {data && data.configured === false && (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-6 text-sm leading-relaxed text-[#8a8a8a]">
          <h3 className="text-base font-semibold text-[#f5f5f5]">Cuotas no configuradas</h3>
          <p className="mt-2">
            Para mostrar las cuotas de las casas de apuestas, añade la variable de entorno{' '}
            <code className="rounded bg-[#0a0a0a] px-1.5 py-0.5 text-[#E8B84B]">ODDS_API_KEY</code>{' '}
            en la configuración del proyecto (Vercel → Settings → Environment Variables) con una
            clave gratuita de The Odds API.
          </p>
          <a
            href="https://the-odds-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[#E8B84B] hover:underline"
          >
            the-odds-api.com
            <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Error */}
      {data?.error && (
        <div className="mt-6 flex items-start gap-2 rounded-2xl border border-[#E8B84B]/30 bg-[#E8B84B]/10 p-4 text-sm text-[#E8B84B]">
          <AlertTriangle size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>No se pudieron cargar las cuotas ahora mismo. Inténtalo de nuevo en un momento.</span>
        </div>
      )}

      {/* Outright table */}
      {outrightRows && outrightRows.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-[#f5f5f5]">Ganador del Mundial</h3>
          <div className="overflow-x-auto rounded-2xl border border-[#262626] bg-[#141414] p-4 sm:p-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                  <th className="py-1.5 pl-1 text-left font-medium">Selección</th>
                  <th className="px-3 text-right font-medium">Cuota</th>
                  <th className="px-3 text-right font-medium">Prob. implícita</th>
                  <th className="px-3 text-right font-medium">Prob. modelo</th>
                  <th className="px-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {outrightRows.map((r) => (
                  <tr key={r.teamId} className="border-t border-[#262626]">
                    <td className="py-2 pl-1">
                      <div className="flex items-center gap-2">
                        <Flag teamId={r.teamId} className="text-base leading-none" />
                        <span className="truncate text-[#f5f5f5]">
                          {TEAMS[r.teamId]?.name ?? r.teamId}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 text-right tabular-nums text-[#f5f5f5]">
                      {fmtOdds(r.odds)}
                    </td>
                    <td className="px-3 text-right tabular-nums text-[#8a8a8a]">
                      {fmtPct(r.implied)}
                    </td>
                    <td className="px-3 text-right tabular-nums text-[#f5f5f5]">
                      {fmtPct(r.model)}
                    </td>
                    <td className="px-3 text-right">
                      <ValueTag value={r.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Per-match 1X2 */}
      {matchRows && matchRows.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-1 text-sm font-semibold text-[#f5f5f5]">Por partido (1X2)</h3>
          <p className="mb-3 text-xs text-[#5a5a5a]">
            Modelo: {MATCH_N} simulaciones por partido.
            {capped && ` Mostrando los próximos ${MATCH_CAP} partidos.`}
          </p>
          <div className="flex flex-col gap-3">
            {matchRows.map((m) => (
              <div
                key={`${m.homeId}-${m.awayId}-${m.commence_time ?? ''}`}
                className="rounded-2xl border border-[#262626] bg-[#141414] p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#f5f5f5]">
                  <Flag teamId={m.homeId} className="text-base leading-none" />
                  <span>{TEAMS[m.homeId]?.name ?? m.homeId}</span>
                  <span className="text-[#5a5a5a]">vs</span>
                  <Flag teamId={m.awayId} className="text-base leading-none" />
                  <span>{TEAMS[m.awayId]?.name ?? m.awayId}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['1', 'X', '2'] as const).map((label, i) => {
                    const c = m.cells[i]
                    return (
                      <div
                        key={label}
                        className="rounded-xl border border-[#262626] bg-[#0a0a0a] p-3"
                      >
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">
                          {label}
                        </div>
                        <div className="tabular-nums text-sm font-semibold text-[#f5f5f5]">
                          {fmtOdds(c.odds)}
                        </div>
                        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[#8a8a8a]">
                          <span>impl. {fmtPct(c.implied)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] tabular-nums text-[#8a8a8a]">
                          <span>mod. {fmtPct(c.model)}</span>
                        </div>
                        <div className="mt-1">
                          <ValueTag value={c.value} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Configured but empty (no upcoming odds yet) */}
      {data?.configured &&
        !data.error &&
        outrightRows?.length === 0 &&
        matchRows?.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-6 text-center text-sm text-[#8a8a8a]">
            No hay cuotas disponibles en este momento. Vuelve a intentarlo más tarde.
          </div>
        )}
    </div>
  )
}
