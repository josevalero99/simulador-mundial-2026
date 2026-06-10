import {
  LayoutGrid,
  Medal,
  Swords,
  Percent,
  Ticket,
  Radio,
  TrendingUp,
  Newspaper,
  Scale,
  type LucideIcon,
} from 'lucide-react'
import type { TabKey } from '@/lib/nav/tabs'

/** Icono de cada pestaña. Vive en la capa de presentación, fuera del modelo puro. */
export const TAB_ICONS: Record<TabKey, LucideIcon> = {
  grupos: LayoutGrid,
  terceros: Medal,
  eliminatorias: Swords,
  probabilidades: Percent,
  porra: Ticket,
  directo: Radio,
  cuotas: TrendingUp,
  noticias: Newspaper,
  comparador: Scale,
}
