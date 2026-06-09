import { describe, it, expect } from 'vitest'
import { allocateThirds } from '../bracket'
import { THIRD_SLOT_MATCHES } from '@/lib/data/r32'
import { GroupId } from '@/lib/types'

describe('allocateThirds', () => {
  it('maps the 8 third-slot matches to distinct groups within the combo', () => {
    const combo: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const allocation = allocateThirds(combo)

    // Keys are exactly the eight third-slot match numbers.
    const keys = Object.keys(allocation).map(Number).sort((a, b) => a - b)
    expect(keys).toEqual([...THIRD_SLOT_MATCHES].sort((a, b) => a - b))

    // All 8 source groups are distinct and belong to the combo.
    const values = Object.values(allocation)
    expect(new Set(values).size).toBe(8)
    for (const g of values) expect(combo).toContain(g)
  })

  it('is order-independent (sorts the combo before lookup)', () => {
    const a = allocateThirds(['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'])
    const b = allocateThirds(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
    expect(a).toEqual(b)
  })

  it('throws on a bad combination (wrong number of groups)', () => {
    expect(() => allocateThirds(['A', 'B', 'C', 'D', 'E', 'F', 'G']))
      .toThrow('No allocation for combination: ABCDEFG')
  })
})
