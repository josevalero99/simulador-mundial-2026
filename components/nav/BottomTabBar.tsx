'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ALL_TABS, primaryIndices, secondaryIndices } from '@/lib/nav/tabs'
import { TAB_ICONS } from '@/components/nav/tabIcons'
import BottomSheet from '@/components/ui/BottomSheet'

interface BottomTabBarProps {
  active: number
  onChange: (i: number) => void
}

/** Navegación principal en MÓVIL: 4 destinos primarios + "Más". Oculta en desktop. */
export default function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  const { state } = useStore()
  const [moreOpen, setMoreOpen] = useState(false)
  const primary = primaryIndices(state.liveMode)
  const secondary = secondaryIndices(state.liveMode)
  const moreActive = secondary.includes(active)

  const select = (i: number) => {
    onChange(i)
    setMoreOpen(false)
  }

  const itemCls = (isActive: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium ${
      isActive ? 'text-[#E8B84B]' : 'text-[#7a7a7a]'
    }`

  return (
    <>
      <nav
        role="tablist"
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      >
        {primary.map((i) => {
          const tab = ALL_TABS[i]
          const Icon = TAB_ICONS[tab.key]
          const isActive = i === active
          const color = tab.iconColor ?? (isActive ? '#E8B84B' : '#7a7a7a')
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.full}
              onClick={() => select(i)}
              className={itemCls(isActive)}
            >
              <Icon size={20} strokeWidth={2} color={color} aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-label="Más secciones"
          onClick={() => setMoreOpen(true)}
          className={itemCls(moreActive)}
        >
          <Menu size={20} strokeWidth={2} color={moreActive ? '#E8B84B' : '#7a7a7a'} aria-hidden="true" />
          Más
        </button>
      </nav>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Más secciones">
        {secondary.map((i) => {
          const tab = ALL_TABS[i]
          const Icon = TAB_ICONS[tab.key]
          const isActive = i === active
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => select(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                isActive ? 'text-[#E8B84B]' : 'text-[#f5f5f5]'
              }`}
            >
              <Icon size={18} strokeWidth={2} color={tab.iconColor} aria-hidden="true" />
              {tab.full}
            </button>
          )
        })}
      </BottomSheet>
    </>
  )
}
