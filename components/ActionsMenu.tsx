'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SCENARIO_ACTIONS } from '@/components/actions/scenarioActions'

/** "Acciones" dropdown (desktop): Simular por ranking / Rellenar escenario / Limpiar. */
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
          className="absolute left-0 z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16161c]/55 p-1 shadow-xl backdrop-blur-xl"
        >
          {SCENARIO_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              onClick={() => {
                a.run(dispatch)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${a.danger ? 'text-[#E16B6B]' : 'text-[#f5f5f5]'}`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
