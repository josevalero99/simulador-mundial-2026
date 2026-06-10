'use client'

import { useEffect, useRef } from 'react'
import { ALL_TABS } from '@/lib/nav/tabs'
import { TAB_ICONS } from '@/components/nav/tabIcons'

interface TabNavProps {
  active: number
  onChange: (i: number) => void
}

/**
 * Navegación de pestañas en DESKTOP (oculta en móvil, donde manda el
 * BottomTabBar). Fila horizontal de pills con scroll-snap; la pestaña activa
 * se auto-centra. Controlada por `active` / `onChange`.
 */
export default function TabNav({ active, onChange }: TabNavProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    tabRefs.current[active]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <div
      role="tablist"
      aria-label="Secciones del simulador"
      className="no-scrollbar hidden flex-nowrap gap-2 overflow-x-auto sm:flex"
      style={{ scrollSnapType: 'x proximity' }}
    >
      {ALL_TABS.map((tab, i) => {
        const isActive = i === active
        const Icon = TAB_ICONS[tab.key]
        const computedIconColor = tab.iconColor ?? (isActive ? '#0a0a0a' : undefined)
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[i] = node
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.full}
            title={tab.full}
            onClick={() => onChange(i)}
            style={{ scrollSnapAlign: 'start' }}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-[#E8B84B] bg-[#E8B84B] text-[#0a0a0a]'
                : 'border-white/10 bg-white/5 text-[#f5f5f5] backdrop-blur-md hover:border-white/20 hover:bg-white/10',
            ].join(' ')}
          >
            <Icon
              size={16}
              strokeWidth={2}
              color={computedIconColor}
              className={tab.iconColor ? '' : isActive ? '' : 'text-[#8a8a8a]'}
              aria-hidden="true"
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
