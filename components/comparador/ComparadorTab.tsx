'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import { useOdds } from '@/components/odds/OddsProvider'
import { useFavorite } from '@/components/favorite/FavoriteProvider'
import { matchOutcomeProbs, mostLikelyScore } from '@/lib/engine/montecarlo'
import { getH2H, getForm } from '@/lib/data/comparador'
import { SNAPSHOT_DATE, type FormMatch } from '@/lib/data/comparadorData'
import { groupOf } from '@/lib/data/groups'
import { useTournamentProbs } from '@/components/probabilities/useTournamentProbs'
import TeamSelect from './TeamSelect'

const SECTION = 'rounded-2xl border border-white/10 bg-[#16161c]/55 p-4 backdrop-blur-xl'
const LABEL = 'mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#777]'
const pct = (p: number) => `${Math.round(p * 100)}%`

/** Por defecto: favorito (o mejor ranking) y el siguiente mejor distinto. */
function defaults(favorite: string | null): [string, string] {
  const ranked = Object.values(TEAMS).sort((a, b) => a.fifaRank - b.fifaRank)
  const a = favorite && TEAMS[favorite] ? favorite : ranked[0].id
  const b = ranked.find((t) => t.id !== a)?.id ?? ranked[1].id
  return [a, b]
}

function FormChips({ form }: { form: FormMatch[] }) {
  if (form.length === 0) return <span className="text-xs text-[#777]">Sin datos</span>
  const cls = { W: 'bg-[#3CAC3B] text-[#0a0a0a]', D: 'bg-[#52525b] text-[#f5f5f5]', L: 'bg-[#E16B6B] text-[#0a0a0a]' }
  const letter = { W: 'V', D: 'E', L: 'D' } as const
  return (
    <span className="flex gap-1">
      {form.map((m, i) => (
        <span
          key={i}
          title={`${m.gf}-${m.ga} vs ${m.oppName}`}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-extrabold ${cls[m.res]}`}
        >
          {letter[m.res]}
        </span>
      ))}
    </span>
  )
}

export default function ComparadorTab() {
  const { favorite } = useFavorite()
  const { marketFn } = useOdds()
  const [[ia, ib]] = useState(() => defaults(favorite))
  const [a, setA] = useState(ia)
  const [b, setB] = useState(ib)

  const teamA = TEAMS[a]
  const teamB = TEAMS[b]

  const outcome = useMemo(() => matchOutcomeProbs(a, b, undefined, undefined, marketFn), [a, b, marketFn])
  const score = useMemo(() => mostLikelyScore(a, b), [a, b])
  const h2h = useMemo(() => getH2H(a, b), [a, b])
  const formA = useMemo(() => getForm(a), [a])
  const formB = useMemo(() => getForm(b), [b])
  const groupA = groupOf(a)
  const groupB = groupOf(b)

  // % campeón (Monte Carlo del escenario), calculado al entrar y al cambiar escenario.
  const { probs, computing, compute } = useTournamentProbs(1500)
  useEffect(() => {
    compute()
  }, [compute])

  const champA = probs?.[a]?.champion
  const champB = probs?.[b]?.champion

  const swap = () => {
    setA(b)
    setB(a)
  }

  // Fila de stat con la mejor en dorado. lowerBetter para ranking.
  const statRow = (label: string, va: number | string, vb: number | string, winner: 'a' | 'b' | null) => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/[0.06] py-2 last:border-0">
      <span className={`text-right text-sm font-bold ${winner === 'a' ? 'text-[#E8B84B]' : 'text-[#cfcfcf]'}`}>{va}</span>
      <span className="text-center text-[9px] uppercase tracking-wide text-[#777]">{label}</span>
      <span className={`text-left text-sm font-bold ${winner === 'b' ? 'text-[#E8B84B]' : 'text-[#cfcfcf]'}`}>{vb}</span>
    </div>
  )

  const rankWinner = teamA.fifaRank === teamB.fifaRank ? null : teamA.fifaRank < teamB.fifaRank ? 'a' : 'b'
  const eloWinner = teamA.fifaPoints === teamB.fifaPoints ? null : teamA.fifaPoints > teamB.fifaPoints ? 'a' : 'b'

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-3">
      {/* selectores */}
      <div className="flex items-center gap-2">
        <TeamSelect value={a} onChange={setA} exclude={b} />
        <button
          type="button"
          onClick={swap}
          aria-label="Intercambiar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#E8B84B] transition-colors hover:bg-white/10"
        >
          <ArrowLeftRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <TeamSelect value={b} onChange={setB} exclude={a} />
      </div>

      {/* versus hero */}
      <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{teamA.flag}</span>
          <span className="text-xs font-bold text-[#f5f5f5]">{teamA.name}</span>
        </div>
        <span className="text-lg font-extrabold text-[#E8B84B]">VS</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl leading-none">{teamB.flag}</span>
          <span className="text-xs font-bold text-[#f5f5f5]">{teamB.name}</span>
        </div>
      </div>

      {/* 1X2 Elo */}
      <div className={SECTION}>
        <div className={LABEL}>Si se enfrentaran (modelo Elo)</div>
        <div className="flex h-7 overflow-hidden rounded-lg text-[10px] font-bold">
          <div className="flex items-center justify-center bg-[#7aa2ff] text-[#0a0a0a]" style={{ width: `${outcome.home * 100}%` }}>{pct(outcome.home)}</div>
          <div className="flex items-center justify-center bg-[#52525b] text-[#f5f5f5]" style={{ width: `${outcome.draw * 100}%` }}>X {pct(outcome.draw)}</div>
          <div className="flex items-center justify-center bg-[#E8B84B] text-[#0a0a0a]" style={{ width: `${outcome.away * 100}%` }}>{pct(outcome.away)}</div>
        </div>
      </div>

      {/* stats */}
      <div className={SECTION}>
        {statRow('Ranking FIFA', teamA.fifaRank, teamB.fifaRank, rankWinner)}
        {statRow('Puntos Elo', teamA.fifaPoints, teamB.fifaPoints, eloWinner)}
        {statRow('Confederación', teamA.confederation, teamB.confederation, null)}
        {statRow('Grupo', groupA ? `Grupo ${groupA}` : '—', groupB ? `Grupo ${groupB}` : '—', null)}
      </div>

      {/* forma */}
      <div className={SECTION}>
        <div className={LABEL}>Forma reciente (últimos 5)</div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
          <FormChips form={formA} />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
          <FormChips form={formB} />
        </div>
      </div>

      {/* h2h */}
      <div className={SECTION}>
        <div className={LABEL}>Cara a cara (histórico)</div>
        {h2h ? (
          <>
            <div className="mb-2 flex items-center justify-around text-center">
              <div><div className="text-xl font-extrabold text-[#E8B84B]">{h2h.winsA}</div><div className="text-[9px] uppercase text-[#777]">{teamA.flag} gana</div></div>
              <div><div className="text-xl font-extrabold text-[#8a8a8a]">{h2h.draws}</div><div className="text-[9px] uppercase text-[#777]">empates</div></div>
              <div><div className="text-xl font-extrabold text-[#f5f5f5]">{h2h.winsB}</div><div className="text-[9px] uppercase text-[#777]">{teamB.flag} gana</div></div>
            </div>
            <div className="text-[11px] leading-relaxed text-[#bdbdbd]">
              {h2h.played} partidos
              {h2h.last.map((m, i) => (
                <span key={i}> · {m.date.slice(0, 4)}: {TEAMS[m.loId]?.name ?? m.loId} {m.loGoals}–{m.hiGoals} {TEAMS[m.hiId]?.name ?? m.hiId}</span>
              ))}
            </div>
          </>
        ) : (
          <span className="text-xs text-[#777]">Sin enfrentamientos registrados</span>
        )}
      </div>

      {/* marcador más probable */}
      <div className="rounded-2xl border border-[#E8B84B]/25 bg-[#E8B84B]/[0.08] p-4">
        <div className={LABEL}>Marcador más probable (Elo)</div>
        <div className="flex items-center justify-center gap-3 text-sm text-[#f5f5f5]">
          <span>{teamA.flag}</span>
          <span className="rounded-lg bg-white/[0.06] px-3 py-0.5 text-2xl font-extrabold text-white">{score.homeGoals}</span>
          <span>–</span>
          <span className="rounded-lg bg-white/[0.06] px-3 py-0.5 text-2xl font-extrabold text-white">{score.awayGoals}</span>
          <span>{teamB.flag}</span>
        </div>
      </div>

      {/* % campeón */}
      <div className={SECTION}>
        <div className={LABEL}>🏆 Probabilidad de ser campeón</div>
        {computing && !probs ? (
          <span className="text-xs text-[#777]">Calculando…</span>
        ) : (
          <div className={`transition-opacity ${computing ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between py-1 text-xs font-semibold">
              <span className="text-[#f5f5f5]">{teamA.flag} {teamA.name}</span>
              <span className="text-[#E8B84B]">{champA != null ? pct(champA) : '—'}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-xs font-semibold">
              <span className="text-[#f5f5f5]">{teamB.flag} {teamB.name}</span>
              <span className="text-[#f5f5f5]">{champB != null ? pct(champB) : '—'}</span>
            </div>
          </div>
        )}
      </div>

      <p className="px-1 pb-2 text-center text-[10px] text-[#5a5a5a]">Forma y cara a cara: datos hasta {SNAPSHOT_DATE}.</p>
    </div>
  )
}
