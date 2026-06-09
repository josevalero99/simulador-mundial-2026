'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Bookmark, Link2, Trash2, ChevronDown, FolderOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import { encodeScenario, decodeScenario } from '@/lib/share'

const SAVES_KEY = 'wc2026-saves'
const MAX_SAVES = 20

interface SavedPrediction {
  name: string
  e: string
  savedAt: string
}

function readSaves(): SavedPrediction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(SAVES_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (x): x is SavedPrediction =>
        x &&
        typeof x.name === 'string' &&
        typeof x.e === 'string' &&
        typeof x.savedAt === 'string',
    )
  } catch {
    return []
  }
}

function writeSaves(saves: SavedPrediction[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SAVES_KEY, JSON.stringify(saves))
  } catch {
    // ignore quota errors
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "Guardar / Compartir": comparte un enlace y gestiona predicciones guardadas. */
export default function SaveShareMenu() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saves, setSaves] = useState<SavedPrediction[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setSaves(readSaves())
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

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}${window.location.pathname}?e=${encodeScenario(state.matches)}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Insecure context / permission denied: fall back to a prompt the user
      // can copy from manually. Either way we still show feedback.
      try {
        window.prompt('Copia el enlace:', url)
      } catch {
        // ignore
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (typeof window === 'undefined') return
    const name = window.prompt('Nombre de la predicción')
    if (!name || !name.trim()) return
    const entry: SavedPrediction = {
      name: name.trim(),
      e: encodeScenario(state.matches),
      savedAt: new Date().toISOString(),
    }
    const next = [entry, ...readSaves()].slice(0, MAX_SAVES)
    writeSaves(next)
    setSaves(next)
  }

  const handleLoad = (e: string) => {
    const scores = decodeScenario(e)
    if (scores) dispatch({ type: 'APPLY_SCENARIO', scores })
    setOpen(false)
  }

  const handleDelete = (savedAt: string) => {
    const next = readSaves().filter((s) => s.savedAt !== savedAt)
    writeSaves(next)
    setSaves(next)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#f5f5f5] backdrop-blur-md transition-colors hover:bg-white/10"
      >
        <Share2 size={13} strokeWidth={2} aria-hidden="true" />
        Guardar / Compartir
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16161c]/55 p-1 shadow-xl backdrop-blur-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleShare}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
          >
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
            {copied ? '¡Enlace copiado!' : 'Compartir enlace'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSave}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
          >
            <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
            Guardar predicción
          </button>

          <div className="my-1 border-t border-white/10" />

          {saves.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[#8a8a8a]">Sin predicciones guardadas</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {saves.map((s) => (
                <li key={s.savedAt} className="flex items-center gap-1 rounded-lg hover:bg-white/10">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleLoad(s.e)}
                    title="Cargar predicción"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                  >
                    <FolderOpen size={15} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#8a8a8a]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[#f5f5f5]">{s.name}</span>
                      <span className="block text-[10px] text-[#8a8a8a]">{formatDate(s.savedAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.savedAt)}
                    aria-label={`Eliminar ${s.name}`}
                    title="Eliminar"
                    className="mr-1 shrink-0 rounded-lg p-1.5 text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#E61D25]"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
