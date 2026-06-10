import { describe, it, expect } from 'vitest'
import { ALL_TABS, primaryIndices, secondaryIndices } from './tabs'

describe('navigation model', () => {
  it('define las 9 pestañas en el orden de page.tsx', () => {
    expect(ALL_TABS.map((t) => t.key)).toEqual([
      'grupos', 'terceros', 'eliminatorias', 'probabilidades',
      'porra', 'directo', 'cuotas', 'noticias', 'comparador',
    ])
  })

  it('bottom bar por defecto = Grupos, Eliminatorias, Probabilidades, Comparador', () => {
    expect(primaryIndices(false)).toEqual([0, 2, 3, 8])
  })

  it('Porra es secundaria (en "Más") en ambos modos', () => {
    expect(secondaryIndices(false)).toContain(4)
    expect(secondaryIndices(true)).toContain(4)
    expect(primaryIndices(false)).not.toContain(4)
    expect(primaryIndices(true)).not.toContain(4)
  })

  it('en modo en vivo: Directo entra al bottom bar y Comparador baja a "Más"', () => {
    expect(primaryIndices(true)).toContain(5) // Directo primario en vivo
    expect(primaryIndices(false)).not.toContain(5) // ...secundario fuera de vivo
    expect(primaryIndices(true)).not.toContain(8) // Comparador deja de ser primario
    expect(secondaryIndices(true)).toContain(8) // ...y pasa a "Más"
  })

  it('primarios + secundarios cubren las 9 pestañas sin solape (ambos modos)', () => {
    for (const live of [false, true]) {
      const all = [...primaryIndices(live), ...secondaryIndices(live)].sort((a, b) => a - b)
      expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    }
  })

  it('el bottom bar siempre tiene 4 destinos primarios', () => {
    expect(primaryIndices(false)).toHaveLength(4)
    expect(primaryIndices(true)).toHaveLength(4)
  })
})
