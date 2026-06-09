interface Tab {
  label: string
  badge: string
}

const TABS: Tab[] = [
  { label: 'Fase de grupos', badge: '1' },
  { label: 'Mejores terceros', badge: '2' },
  { label: 'Eliminatorias', badge: '3' },
  { label: 'Probabilidades', badge: '%' },
  { label: 'Porra', badge: '🏆' },
]

interface TabNavProps {
  active: number
  onChange: (i: number) => void
}

/** Controlled tab navigation with a leading number/symbol badge per tab. */
export default function TabNav({ active, onChange }: TabNavProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones del simulador">
      {TABS.map((tab, i) => {
        const isActive = i === active
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(i)}
            className={[
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-[#c6f24e] bg-[#c6f24e] text-[#0a0a0a]'
                : 'border-[#262626] bg-[#141414] text-[#f5f5f5] hover:border-[#3a3a3a]',
            ].join(' ')}
          >
            <span
              className={[
                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold leading-none',
                isActive ? 'bg-[#0a0a0a] text-[#c6f24e]' : 'bg-[#1c1c1c] text-[#8a8a8a]',
              ].join(' ')}
            >
              {tab.badge}
            </span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
