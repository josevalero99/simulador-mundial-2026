'use client'

import { useEffect, useRef, useState } from 'react'
import { Wand2, Dices, Eraser, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'

/** "Acciones" dropdown: Simular por ranking / Rellenar escenario / Limpiar. */
export default function ActionsMenu() {
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
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#f5f5f5] transition-colors hover:bg-white/10"
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
        className="inline-flex items-center gap-1.5 rounded-full bg-[#E8B84B] px-3 py-1 text-xs font-semibold text-[#0a0a0a] transition-colors hover:bg-[#d9a93c]"
      >
        Acciones
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
          className="absolute left-0 z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-1 shadow-xl"
        >
          {item(<Wand2 size={16} strokeWidth={2} aria-hidden="true" />, 'Simular por ranking', () =>
            dispatch({ type: 'SIMULATE_BY_RANKING' }),
          )}
          {item(<Dices size={16} strokeWidth={2} aria-hidden="true" />, 'Rellenar escenario', () =>
            dispatch({ type: 'FILL_SCENARIO' }),
          )}
          {item(<Eraser size={16} strokeWidth={2} aria-hidden="true" />, 'Limpiar', () =>
            dispatch({ type: 'CLEAR' }),
          )}
        </div>
      )}
    </div>
  )
}
