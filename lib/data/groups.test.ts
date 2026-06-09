import { describe, it, expect } from 'vitest'
import { GROUPS } from './groups'
import { TEAMS } from './teams'
describe('GROUPS', () => {
  const all = Object.values(GROUPS).flat()
  it('48 unique ids', () => { expect(new Set(all).size).toBe(48) })
  it('all ids exist in TEAMS', () => { all.forEach(id => expect(TEAMS[id]).toBeTruthy()) })
  it('one team per pot in each group', () => {
    for (const ids of Object.values(GROUPS)) expect(ids.map(id=>TEAMS[id].pot).sort()).toEqual([1,2,3,4])
  })
})
