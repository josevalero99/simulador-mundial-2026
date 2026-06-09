'use client'

import { useEffect, useRef } from 'react'
import {
  LayoutGrid,
  Medal,
  Swords,
  Percent,
  Ticket,
  Radio,
  TrendingUp,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'

interface Tab {
  label: string
  Icon: LucideIcon
  /** Force a fixed icon color (e.g. "En directo" stays red even when inactive). */
  iconColor?: string
}

const TABS: Tab[] = [
  { label: 'Fase de grupos', Icon: LayoutGrid },
  { label: 'Mejores terceros', Icon: Medal },
  { label: 'Eliminatorias', Icon: Swords },
  { label: 'Probabilidades', Icon: Percent },
  { label: 'Porra', Icon: Ticket },
  { label: 'En directo', Icon: Radio, iconColor: '#E61D25' },
  { label: 'Cuotas', Icon: TrendingUp },
  { label: 'Noticias', Icon: Newspaper },
]

interface TabNavProps {
  active: number
  onChange: (i: number) => void
}

/**
 * Controlled tab navigation. Single horizontal row of pills with a leading
 * lucide icon. On mobile it scrolls horizontally (swipe + scroll-snap); the
 * row scrolls when the tabs don't fit. The active tab auto-scrolls into view.
 */
export default function TabNav({ active, onChange }: TabNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = tabRefs.current[active]
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Secciones del simulador"
      className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto"
      style={{ scrollSnapType: 'x proximity' }}
    >
      {TABS.map((tab, i) => {
        const isActive = i === active
        const { Icon, iconColor } = tab
        const computedIconColor = iconColor ?? (isActive ? '#0a0a0a' : undefined)
        return (
          <button
            key={tab.label}
            ref={(node) => {
              tabRefs.current[i] = node
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(i)}
            style={{ scrollSnapAlign: 'start' }}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-[#E8B84B] bg-[#E8B84B] text-[#0a0a0a]'
                : 'border-[#262626] bg-[#141414] text-[#f5f5f5] hover:border-[#3a3a3a]',
            ].join(' ')}
          >
            <Icon
              size={16}
              strokeWidth={2}
              color={computedIconColor}
              className={iconColor ? '' : isActive ? '' : 'text-[#8a8a8a]'}
              aria-hidden="true"
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
