import { Wand2, Dices, Eraser } from 'lucide-react'
import type React from 'react'
import type { Action } from '@/lib/store'

export interface ScenarioAction {
  icon: React.ReactNode
  label: string
  danger?: boolean
  run: (dispatch: React.Dispatch<Action>) => void
}

/** Acciones globales de escenario, compartidas por el dropdown desktop y la hoja móvil. */
export const SCENARIO_ACTIONS: ScenarioAction[] = [
  {
    icon: <Wand2 size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Simular por ranking',
    run: (d) => d({ type: 'SIMULATE_BY_RANKING' }),
  },
  {
    icon: <Dices size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Rellenar escenario',
    run: (d) => d({ type: 'FILL_SCENARIO' }),
  },
  {
    icon: <Eraser size={16} strokeWidth={2} aria-hidden="true" />,
    label: 'Limpiar',
    danger: true,
    run: (d) => d({ type: 'CLEAR' }),
  },
]
