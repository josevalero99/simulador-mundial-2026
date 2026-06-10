import { describe, it, expect } from 'vitest'
import { groupOf } from './groups'

describe('groupOf', () => {
  it('devuelve el grupo de un equipo', () => {
    expect(groupOf('MEX')).toBe('A')
    expect(groupOf('ESP')).toBe('H')
    expect(groupOf('ARG')).toBe('J')
  })
  it('devuelve undefined si el equipo no está en ningún grupo', () => {
    expect(groupOf('XXX')).toBeUndefined()
  })
})
