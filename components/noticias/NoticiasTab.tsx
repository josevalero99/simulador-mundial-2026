'use client'

import { useCallback, useEffect, useState } from 'react'
import { Newspaper, ExternalLink, RotateCw, Tv, Headphones } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  source: string
  pubDate: string
  spain: boolean
}

type Filter = 'todas' | 'espana' | 'resto'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'espana', label: 'Selección española' },
  { id: 'resto', label: 'Resto de selecciones' },
]

/** "hace 2 h" / "hace 3 d" style relative time, fallback to a Madrid date. */
function relative(pubDate: string): string {
  const t = Date.parse(pubDate)
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const min = Math.round(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 7) return `hace ${d} d`
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: 'short',
  }).format(t)
}

export default function NoticiasTab() {
  const [items, setItems] = useState<NewsItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('todas')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/noticias')
      const json = (await res.json()) as { items: NewsItem[]; error?: string }
      setError(json.error ?? null)
      setItems(json.items ?? [])
    } catch {
      setError('fetch-failed')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount and auto-refresh every 5 minutes.
  useEffect(() => {
    void load()
    const id = setInterval(() => void load(), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  const filtered =
    items?.filter((it) =>
      filter === 'todas' ? true : filter === 'espana' ? it.spain : !it.spain,
    ) ?? null

  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#262626] bg-[#141414] p-5">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper size={18} strokeWidth={2} className="text-[#E8B84B]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#f5f5f5]">Noticias del Mundial 2026</h2>
          </div>
          <p className="mt-1 text-sm text-[#8a8a8a]">
            Titulares de varios medios (vía Google Noticias). Pulsa para leer en la fuente original.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#262626] bg-[#0a0a0a] px-3 py-1.5 text-xs font-medium text-[#f5f5f5] transition-colors hover:border-[#3a3a3a] disabled:opacity-50"
        >
          <RotateCw size={14} strokeWidth={2} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Accesos directos para seguir el Mundial en directo */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="https://www.rtve.es/play/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#E8B84B]"
        >
          <Tv size={16} strokeWidth={2} className="text-[#E8B84B]" aria-hidden="true" />
          RTVE Play
          <ExternalLink size={13} strokeWidth={2} className="text-[#5a5a5a]" aria-hidden="true" />
        </a>
        <a
          href="https://www.cope.es/deportes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#E8B84B]"
        >
          <Headphones size={16} strokeWidth={2} className="text-[#E8B84B]" aria-hidden="true" />
          Deportes COPE
          <ExternalLink size={13} strokeWidth={2} className="text-[#5a5a5a]" aria-hidden="true" />
        </a>
      </div>

      {/* Filtros */}
      <div className="no-scrollbar mt-4 flex flex-nowrap gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const isActive = f.id === filter
          const count = items?.filter((it) =>
            f.id === 'todas' ? true : f.id === 'espana' ? it.spain : !it.spain,
          ).length
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={[
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-[#E8B84B] bg-[#E8B84B] text-[#0a0a0a]'
                  : 'border-[#262626] bg-[#141414] text-[#f5f5f5] hover:border-[#3a3a3a]',
              ].join(' ')}
            >
              {f.label}
              {typeof count === 'number' && (
                <span className={isActive ? 'text-[#0a0a0a]/60' : 'text-[#5a5a5a]'}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b]">
          <span className="mr-1">⚠</span>
          No se pudieron cargar las noticias. Inténtalo de nuevo en un momento.
        </div>
      )}

      {filtered === null ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-sm text-[#8a8a8a]">
          Cargando noticias…
        </div>
      ) : filtered.length === 0 && !error ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-sm text-[#8a8a8a]">
          No hay noticias para este filtro.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {filtered.map((it, i) => (
            <li key={`${it.link}-${i}`}>
              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4 transition-colors hover:border-[#3a3a3a]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-[#f5f5f5] group-hover:text-[#E8B84B]">
                    {it.title}
                  </p>
                  <p className="mt-1 text-xs text-[#8a8a8a]">
                    {it.source}
                    {it.source && it.pubDate ? ' · ' : ''}
                    {relative(it.pubDate)}
                  </p>
                </div>
                <ExternalLink
                  size={15}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-[#5a5a5a] group-hover:text-[#8a8a8a]"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
