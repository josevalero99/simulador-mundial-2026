import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { isoOf } from './flags'
import { GROUPS, GROUP_IDS } from './groups'

describe('flags assets', () => {
  it('cada selección de GROUPS tiene su SVG en public/flags', () => {
    for (const g of GROUP_IDS) {
      for (const id of GROUPS[g]) {
        const iso = isoOf(id)
        expect(iso, `isoOf(${id})`).toBeTruthy()
        const url = new URL(`../../public/flags/${iso}.svg`, import.meta.url)
        const svg = readFileSync(url, 'utf8')
        expect(svg, `${iso}.svg`).toContain('<svg')
      }
    }
  })
})
