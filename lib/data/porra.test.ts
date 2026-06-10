import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PORRA,
  newPorra,
  isValidPorraEntries,
  checkPartition,
  migrate,
  isValidPorrasState,
  type PorraEntry,
  type PorrasState,
} from './porra'
import { TEAMS } from './teams'

describe('DEFAULT_PORRA', () => {
  it('has 12 entries of 4 teams each', () => {
    expect(DEFAULT_PORRA).toHaveLength(12)
    for (const e of DEFAULT_PORRA) {
      expect(e.teams).toHaveLength(4)
    }
  })

  it('is a valid partition: 48 distinct ids, all existing in TEAMS', () => {
    const all = DEFAULT_PORRA.flatMap(e => e.teams)
    expect(all).toHaveLength(48)
    expect(new Set(all).size).toBe(48)
    for (const id of all) {
      expect(TEAMS[id], `team ${id} should exist`).toBeDefined()
    }
    // Equal to the full set of teams.
    expect(new Set(all)).toEqual(new Set(Object.keys(TEAMS)))
  })
})

describe('isValidPorraEntries (generalizado)', () => {
  it('accepts any participant count and uneven team counts', () => {
    const eightBySix: PorraEntry[] = Array.from({ length: 8 }, (_, i) => ({
      name: `P${i}`,
      teams: ['A', 'B', 'C', 'D', 'E', 'F'],
    }))
    expect(isValidPorraEntries(eightBySix)).toBe(true)

    const uneven: PorraEntry[] = [
      { name: 'X', teams: ['A', 'B', 'C', 'D', 'E'] },
      { name: 'Y', teams: ['F', 'G', 'H'] },
    ]
    expect(isValidPorraEntries(uneven)).toBe(true)
  })

  it('rejects empty array, empty teams and non-string teams', () => {
    expect(isValidPorraEntries([])).toBe(false)
    expect(isValidPorraEntries([{ name: 'X', teams: [] }])).toBe(false)
    expect(isValidPorraEntries([{ name: 'X', teams: [1 as unknown as string] }])).toBe(false)
    expect(isValidPorraEntries('nope')).toBe(false)
  })
})

describe('checkPartition', () => {
  it('the default porra is a valid partition of all 48 teams', () => {
    const check = checkPartition(DEFAULT_PORRA)
    expect(check.valid).toBe(true)
    expect(check.duplicated).toEqual([])
    expect(check.unassigned).toEqual([])
  })

  it('flags duplicates and unassigned teams', () => {
    const allIds = Object.keys(TEAMS)
    const entries: PorraEntry[] = [
      { name: 'A', teams: [allIds[0], allIds[0]] },
      { name: 'B', teams: allIds.slice(1, allIds.length - 1) },
    ]
    const check = checkPartition(entries)
    expect(check.valid).toBe(false)
    expect(check.duplicated).toContain(allIds[0])
    expect(check.unassigned).toContain(allIds[allIds.length - 1])
  })
})

describe('newPorra', () => {
  it('clones DEFAULT_PORRA and gives a unique id', () => {
    const a = newPorra('Amigos')
    const b = newPorra('Curro')
    expect(a.name).toBe('Amigos')
    expect(a.id).not.toBe(b.id)
    expect(a.entries).toEqual(DEFAULT_PORRA)
    expect(a.entries).not.toBe(DEFAULT_PORRA)
    a.entries[0].teams[0] = 'ZZZ'
    expect(DEFAULT_PORRA[0].teams[0]).not.toBe('ZZZ')
  })
})

describe('migrate', () => {
  it('wraps a legacy single porra into a PorrasState', () => {
    const state = migrate(null, DEFAULT_PORRA)
    expect(isValidPorrasState(state)).toBe(true)
    expect(state.porras).toHaveLength(1)
    expect(state.porras[0].name).toBe('Porra')
    expect(state.porras[0].entries).toEqual(DEFAULT_PORRA)
    expect(state.activeId).toBe(state.porras[0].id)
  })

  it('is idempotent on an already-valid PorrasState', () => {
    const first = migrate(null, DEFAULT_PORRA)
    const second = migrate(first, null)
    expect(second).toEqual(first)
  })

  it('repairs an activeId that points to no porra', () => {
    const valid = migrate(null, DEFAULT_PORRA)
    const broken: PorrasState = { porras: valid.porras, activeId: 'ghost' }
    const fixed = migrate(broken, null)
    expect(fixed.activeId).toBe(fixed.porras[0].id)
  })

  it('falls back to a default porra on corrupt input', () => {
    const state = migrate({ junk: true }, 'also junk')
    expect(isValidPorrasState(state)).toBe(true)
    expect(state.porras[0].entries).toEqual(DEFAULT_PORRA)
  })
})

describe('isValidPorrasState', () => {
  it('rejects malformed states', () => {
    expect(isValidPorrasState(null)).toBe(false)
    expect(isValidPorrasState({ porras: [], activeId: 'x' })).toBe(false)
    expect(isValidPorrasState({ porras: [{ id: 'a', name: 'A', entries: [] }], activeId: 'a' })).toBe(false)
    expect(isValidPorrasState({ porras: [{ id: 'a', name: 'A', entries: DEFAULT_PORRA }] })).toBe(false)
  })
})
