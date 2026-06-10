import { describe, it, expect } from 'vitest'
import { ALL_TABS, primaryIndices, secondaryIndices } from './tabs'

describe('navigation model', () => {
  it('define las 8 pestañas en el orden de page.tsx', () => {
    expect(ALL_TABS.map((t) => t.key)).toEqual([
      'grupos', 'terceros', 'eliminatorias', 'probabilidades',
      'porra', 'directo', 'cuotas', 'noticias',
    ])
  })

  it('bottom bar por defecto = Grupos, Eliminatorias, Probabilidades, Porra', () => {
    expect(primaryIndices(false)).toEqual([0, 2, 3, 4])
  })

  it('promociona Directo sobre Porra en modo en vivo', () => {
    expect(primaryIndices(true)).toContain(5)
    expect(primaryIndices(true)).not.toContain(4)
    expect(secondaryIndices(true)).toContain(4)
    expect(secondaryIndices(true)).not.toContain(5)
  })

  it('primarios + secundarios cubren las 8 pestañas sin solape (ambos modos)', () => {
    for (const live of [false, true]) {
      const all = [...primaryIndices(live), ...secondaryIndices(live)].sort((a, b) => a - b)
      expect(all).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    }
  })

  it('el bottom bar siempre tiene 4 destinos primarios', () => {
    expect(primaryIndices(false)).toHaveLength(4)
    expect(primaryIndices(true)).toHaveLength(4)
  })
})
