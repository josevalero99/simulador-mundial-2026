'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { TEAMS } from '@/lib/data/teams'

interface TeamSelectProps {
  value: string
  onChange: (id: string) => void
  /** Id que no se puede elegir aquí (el del otro lado). */
  exclude?: string
}

/** Dropdown para elegir una selección (lista de 48, ordenada por nombre). */
export default function TeamSelect({ value, onChange, exclude }: TeamSelectProps) {
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

  const team = TEAMS[value]

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-[#f5f5f5] backdrop-blur-md transition-colors hover:bg-white/10"
      >
        <span className="text-base leading-none">{team?.flag ?? '🏳️'}</span>
        <span className="truncate">{team?.name ?? 'Elegir'}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-30 mt-2 max-h-80 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-white/10 bg-[#16161c]/90 p-1 shadow-xl backdrop-blur-xl"
        >
          {teams.map((t) => {
            const disabled = t.id === exclude
            const active = t.id === value
            return (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                disabled={disabled}
                aria-disabled={disabled}
                onClick={() => {
                  onChange(t.id)
                  setOpen(false)
                }}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  disabled
                    ? 'cursor-not-allowed text-[#5a5a5a]'
                    : active
                      ? 'bg-[#E8B84B]/15 text-[#E8B84B]'
                      : 'text-[#f5f5f5] hover:bg-white/10',
                ].join(' ')}
              >
                <span className="text-base leading-none">{t.flag}</span>
                <span className="truncate">{t.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
