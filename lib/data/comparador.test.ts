import { describe, it, expect } from 'vitest'
import { pairKey, viewH2H, getH2H, getForm } from './comparador'

describe('comparador accesores', () => {
  it('pairKey ordena los ids alfabéticamente', () => {
    expect(pairKey('ESP', 'ARG')).toBe('ARG|ESP')
    expect(pairKey('ARG', 'ESP')).toBe('ARG|ESP')
  })

  it('viewH2H normaliza la orientación a la perspectiva de A', () => {
    const rec = { played: 3, winsLo: 2, draws: 0, winsHi: 1, last: [] }
    // lo = 'ARG', hi = 'ESP'
    expect(viewH2H(rec, 'ARG', 'ESP')).toEqual({ played: 3, winsA: 2, draws: 0, winsB: 1, last: [] })
    expect(viewH2H(rec, 'ESP', 'ARG')).toEqual({ played: 3, winsA: 1, draws: 0, winsB: 2, last: [] })
  })

  it('viewH2H devuelve null sin datos o sin partidos', () => {
    expect(viewH2H(undefined, 'ARG', 'ESP')).toBeNull()
    expect(viewH2H({ played: 0, winsLo: 0, draws: 0, winsHi: 0, last: [] }, 'ARG', 'ESP')).toBeNull()
  })

  it('getForm devuelve [] para un id desconocido', () => {
    expect(getForm('XXX')).toEqual([])
  })

  it('datos generados: forma de selecciones top y h2h clásico existen', () => {
    expect(getForm('ESP').length).toBeGreaterThan(0)
    expect(getForm('ESP').length).toBeLessThanOrEqual(5)
    expect(getH2H('ARG', 'BRA')).not.toBeNull()
  })
})
