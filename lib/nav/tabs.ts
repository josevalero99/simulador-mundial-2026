export type TabKey =
  | 'grupos'
  | 'terceros'
  | 'eliminatorias'
  | 'probabilidades'
  | 'porra'
  | 'directo'
  | 'cuotas'
  | 'noticias'

export interface TabDef {
  key: TabKey
  /** Etiqueta corta para el bottom bar y las pills. */
  label: string
  /** Nombre completo para aria-label / title. */
  full: string
  /** Color fijo del icono (p. ej. "En directo" siempre rojo). */
  iconColor?: string
}

/**
 * Orden canónico: el índice de cada pestaña DEBE coincidir con el `switch`
 * de `app/page.tsx` (0 = Grupos … 7 = Noticias). Tanto TabNav (desktop) como
 * BottomTabBar (móvil) usan estos índices contra el mismo estado `active`.
 */
export const ALL_TABS: TabDef[] = [
  { key: 'grupos', label: 'Grupos', full: 'Fase de grupos' },
  { key: 'terceros', label: 'Terceros', full: 'Mejores terceros' },
  { key: 'eliminatorias', label: 'Eliminatorias', full: 'Eliminatorias' },
  { key: 'probabilidades', label: 'Probabilidades', full: 'Probabilidades' },
  { key: 'porra', label: 'Porra', full: 'Porra' },
  { key: 'directo', label: 'Directo', full: 'En directo', iconColor: '#E61D25' },
  { key: 'cuotas', label: 'Cuotas', full: 'Cuotas' },
  { key: 'noticias', label: 'Noticias', full: 'Noticias' },
]

const GRUPOS = 0
const TERCEROS = 1
const ELIMINATORIAS = 2
const PROBABILIDADES = 3
const PORRA = 4
const DIRECTO = 5
const CUOTAS = 6
const NOTICIAS = 7

/**
 * Los 4 destinos primarios del bottom bar (la UI añade un 5.º slot "Más").
 * En modo en vivo, "Directo" ocupa el slot de "Porra".
 */
export function primaryIndices(liveMode: boolean): number[] {
  return liveMode
    ? [GRUPOS, ELIMINATORIAS, PROBABILIDADES, DIRECTO]
    : [GRUPOS, ELIMINATORIAS, PROBABILIDADES, PORRA]
}

/** Destinos detrás de la hoja "Más", en orden de aparición. */
export function secondaryIndices(liveMode: boolean): number[] {
  return liveMode
    ? [TERCEROS, PORRA, CUOTAS, NOTICIAS]
    : [TERCEROS, DIRECTO, CUOTAS, NOTICIAS]
}
