import { describe, it, expect } from 'vitest'
import { oddsNameToId } from './oddsTeams'

describe('oddsNameToId', () => {
  it('resolves tricky aliases with naming/accent differences', () => {
    expect(oddsNameToId('United States')).toBe('USA')
    expect(oddsNameToId('USA')).toBe('USA')
    expect(oddsNameToId('South Korea')).toBe('KOR')
    expect(oddsNameToId('Korea Republic')).toBe('KOR')
    expect(oddsNameToId('Turkey')).toBe('TUR')
    expect(oddsNameToId('Türkiye')).toBe('TUR')
    expect(oddsNameToId('Turkiye')).toBe('TUR')
    expect(oddsNameToId('Czech Republic')).toBe('CZE')
    expect(oddsNameToId('Czechia')).toBe('CZE')
    expect(oddsNameToId('Bosnia and Herzegovina')).toBe('BIH')
    expect(oddsNameToId('Bosnia & Herzegovina')).toBe('BIH')
    expect(oddsNameToId('Ivory Coast')).toBe('CIV')
    expect(oddsNameToId("Cote d'Ivoire")).toBe('CIV')
    expect(oddsNameToId('Côte d’Ivoire')).toBe('CIV')
    expect(oddsNameToId('Cape Verde')).toBe('CPV')
    expect(oddsNameToId('Cabo Verde')).toBe('CPV')
    expect(oddsNameToId('DR Congo')).toBe('COD')
    expect(oddsNameToId('Congo DR')).toBe('COD')
    expect(oddsNameToId('Democratic Republic of the Congo')).toBe('COD')
    expect(oddsNameToId('Curacao')).toBe('CUW')
    expect(oddsNameToId('Curaçao')).toBe('CUW')
    expect(oddsNameToId('Saudi Arabia')).toBe('KSA')
    expect(oddsNameToId('New Zealand')).toBe('NZL')
    expect(oddsNameToId('South Africa')).toBe('RSA')
  })

  it('resolves a normal name via NAME_TO_ID', () => {
    expect(oddsNameToId('Brazil')).toBe('BRA')
    expect(oddsNameToId('  brazil ')).toBe('BRA')
  })

  it('returns null for Draw', () => {
    expect(oddsNameToId('Draw')).toBeNull()
    expect(oddsNameToId('draw')).toBeNull()
  })

  it('returns null for unknown names', () => {
    expect(oddsNameToId('Atlantis')).toBeNull()
    expect(oddsNameToId('')).toBeNull()
  })
})
