'use client'

import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

/**
 * Hoja inferior reutilizable (solo móvil). Scrim que cierra al pulsar, cierre
 * con ESC, bloqueo de scroll del body y foco devuelto al disparador al cerrar.
 * Sin gestos de arrastre (YAGNI).
 */
export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-white/10 bg-[#16161c]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl outline-none backdrop-blur-xl"
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20" aria-hidden="true" />
        {title && (
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[#8a8a8a]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
