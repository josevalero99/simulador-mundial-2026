import { describe, it, expect } from 'vitest'
import { isoOf } from './flags'
import { GROUPS, GROUP_IDS } from './groups'

describe('isoOf', () => {
  it('mapea casos concretos (incl. Inglaterra/Escocia)', () => {
    expect(isoOf('ESP')).toBe('es')
    expect(isoOf('BRA')).toBe('br')
    expect(isoOf('ENG')).toBe('gb-eng')
    expect(isoOf('SCO')).toBe('gb-sct')
  })
  it('devuelve undefined para un id desconocido', () => {
    expect(isoOf('XXX')).toBeUndefined()
  })
  it('las 48 selecciones de GROUPS tienen ISO', () => {
    for (const g of GROUP_IDS) {
      for (const id of GROUPS[g]) {
        expect(isoOf(id), id).toBeTruthy()
      }
    }
  })
})
