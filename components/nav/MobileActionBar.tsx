'use client'

import { useState } from 'react'
import { MoreHorizontal, Link2, Bookmark, Trash2, FolderOpen, ImageDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import BottomSheet from '@/components/ui/BottomSheet'
import { SCENARIO_ACTIONS } from '@/components/actions/scenarioActions'
import { useSaveShare, formatDate } from '@/components/actions/useSaveShare'
import { useMobileActions } from '@/components/actions/MobileActionsContext'

const ITEM = 'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-white/10'
const LABEL = 'px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#777]'

/** FAB flotante (solo móvil), abajo a la derecha sobre la barra, que abre la hoja de acciones. */
export default function MobileActionBar() {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const { copied, saves, refresh, handleShare, handleSave, handleLoad, handleDelete } = useSaveShare()
  const { exportAction } = useMobileActions()

  const openSheet = () => {
    refresh()
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Acciones"
        className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8B84B] text-[#0a0a0a] shadow-lg shadow-black/50 ring-1 ring-black/10 transition-transform active:scale-95 sm:hidden"
      >
        <MoreHorizontal size={28} strokeWidth={2.5} aria-hidden="true" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Acciones">
        <div className="mb-2">
          <p className={LABEL}>Simulación</p>
          {SCENARIO_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.run(dispatch)
                setOpen(false)
              }}
              className={`${ITEM} ${a.danger ? 'text-[#E16B6B]' : 'text-[#f5f5f5]'}`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 pt-2">
          <p className={LABEL}>Guardar / Compartir</p>
          <button type="button" onClick={() => void handleShare()} className={`${ITEM} text-[#f5f5f5]`}>
            <Link2 size={16} strokeWidth={2} aria-hidden="true" />
            {copied ? '¡Enlace copiado!' : 'Compartir enlace'}
          </button>
          <button type="button" onClick={handleSave} className={`${ITEM} text-[#f5f5f5]`}>
            <Bookmark size={16} strokeWidth={2} aria-hidden="true" />
            Guardar predicción
          </button>
          {exportAction && (
            <button
              type="button"
              onClick={() => {
                exportAction.run()
                setOpen(false)
              }}
              className={`${ITEM} text-[#f5f5f5]`}
            >
              <ImageDown size={16} strokeWidth={2} aria-hidden="true" />
              {exportAction.label}
            </button>
          )}
        </div>

        {saves.length > 0 && (
          <div className="mt-1 border-t border-white/10 pt-2">
            <p className={LABEL}>Guardadas</p>
            <ul className="max-h-56 overflow-y-auto">
              {saves.map((s) => (
                <li key={s.savedAt} className="flex items-center gap-1 rounded-lg hover:bg-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      handleLoad(s.e)
                      setOpen(false)
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left"
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
                    className="mr-1 shrink-0 rounded-lg p-1.5 text-[#8a8a8a] transition-colors hover:bg-white/10 hover:text-[#E61D25]"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
