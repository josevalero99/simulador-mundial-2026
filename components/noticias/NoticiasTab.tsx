'use client'

import { useCallback, useEffect, useState } from 'react'
import { Newspaper, ExternalLink, RotateCw } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  source: string
  pubDate: string
}

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

  useEffect(() => {
    void load()
  }, [load])

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

      {error && (
        <div className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b]">
          <span className="mr-1">⚠</span>
          No se pudieron cargar las noticias. Inténtalo de nuevo en un momento.
        </div>
      )}

      {items === null ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-sm text-[#8a8a8a]">
          Cargando noticias…
        </div>
      ) : items.length === 0 && !error ? (
        <div className="mt-6 rounded-2xl border border-[#262626] bg-[#141414] p-12 text-center text-sm text-[#8a8a8a]">
          No hay noticias por ahora.
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((it, i) => (
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
