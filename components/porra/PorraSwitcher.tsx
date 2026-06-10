'use client'

import { Plus } from 'lucide-react'
import type { Porra } from '@/lib/data/porra'

interface Props {
  porras: Porra[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

/** Active-porra selector plus management actions (new / rename / duplicate / delete). */
export default function PorraSwitcher({
  porras,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const btn =
    'rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-white/10 hover:border-white/20'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={activeId}
        onChange={e => onSelect(e.target.value)}
        aria-label="Porra activa"
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-[#f5f5f5] outline-none focus:border-[#E8B84B]"
      >
        {porras.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.entries.length} part.
          </option>
        ))}
      </select>
      <button type="button" onClick={onNew} className={btn}>
        <Plus size={14} className="mr-1 inline" strokeWidth={2} aria-hidden="true" />
        Nueva
      </button>
      <button type="button" onClick={() => onRename(activeId)} className={btn}>
        Renombrar
      </button>
      <button type="button" onClick={() => onDuplicate(activeId)} className={btn}>
        Duplicar
      </button>
      <button type="button" onClick={() => onDelete(activeId)} className={btn}>
        Borrar
      </button>
    </div>
  )
}
