'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Star, X, ChevronDown } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'
import Flag from '@/components/ui/Flag'
import { useFavorite } from './FavoriteProvider'

/** Header dropdown to pick (or clear) the user's favorite team ("Mi selección"). */
export default function FavoritePicker() {
  const { favorite, setFavorite } = useFavorite()
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

  const teams = useMemo(
    () => Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [],
  )

  const favTeam = favorite ? TEAMS[favorite] : null

  return (
    <div ref={ref} className="relative shrink-0">
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-[#f5f5f5] transition-colors hover:bg-white/10">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
        >
          <Star
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={favTeam ? 'fill-[#E8B84B] text-[#E8B84B]' : 'text-[#E8B84B]'}
          />
          {favTeam ? (
            <span className="inline-flex items-center gap-1.5">
              <Flag teamId={favTeam.id} className="text-sm leading-none" />
              <span className="max-w-[10rem] truncate">{favTeam.name}</span>
            </span>
          ) : (
            <span>Mi selección</span>
          )}
          <ChevronDown
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {favTeam && (
          <button
            type="button"
            onClick={() => setFavorite(null)}
            aria-label="Quitar selección"
            className="mr-1.5 inline-flex items-center rounded-full p-0.5 text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#f5f5f5]"
          >
            <X size={13} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 max-h-80 w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-white/10 bg-[#16161c]/80 backdrop-blur-xl p-1 shadow-xl"
        >
          {favTeam && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setFavorite(null)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#f5f5f5]"
              >
                <X size={15} strokeWidth={2} aria-hidden="true" />
                Quitar selección
              </button>
              <div className="my-1 border-t border-white/10" />
            </>
          )}
          {teams.map((t) => {
            const active = t.id === favorite
            return (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setFavorite(t.id)
                  setOpen(false)
                }}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'bg-[#E8B84B]/15 text-[#E8B84B]'
                    : 'text-[#f5f5f5] hover:bg-white/10',
                ].join(' ')}
              >
                <Flag teamId={t.id} className="text-base leading-none" />
                <span className="truncate">{t.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
