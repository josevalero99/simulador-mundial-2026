import type { ReactNode } from 'react'

type PillColor = 'lime' | 'green' | 'amber' | 'gray' | 'dark'

interface PillProps {
  children: ReactNode
  color?: PillColor
  className?: string
  title?: string
}

const COLOR_STYLES: Record<PillColor, string> = {
  lime: 'bg-[#E8B84B] text-[#0a0a0a]',
  green: 'bg-[#3CAC3B] text-[#0a0a0a]',
  amber: 'bg-[#f59e0b] text-[#0a0a0a]',
  gray: 'bg-[#52525b] text-[#f5f5f5]',
  dark: 'bg-white/[0.07] text-[#8a8a8a]',
}

/**
 * Small rounded label/badge. Used for rank dots/numbers and the `i` indicator.
 */
export default function Pill({ children, color = 'dark', className, title }: PillProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center rounded-full text-xs font-bold leading-none ${COLOR_STYLES[color]} ${className ?? ''}`}
    >
      {children}
    </span>
  )
}
