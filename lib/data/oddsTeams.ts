import { NAME_TO_ID } from './liveResults'

/** Normalize a team name: trim, lowercase, strip accents & punctuation, collapse spaces. */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining accent marks
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ') // punctuation -> space
    .replace(/\s+/g, ' ')
    .trim()
}

// Extra aliases for The Odds API naming differences (normalized key -> our id).
const ALIASES: Record<string, string> = {
  'united states': 'USA',
  usa: 'USA',
  'south korea': 'KOR',
  'korea republic': 'KOR',
  turkey: 'TUR',
  turkiye: 'TUR', // also covers "Türkiye" after accent stripping
  'czech republic': 'CZE',
  czechia: 'CZE',
  'bosnia and herzegovina': 'BIH',
  'bosnia herzegovina': 'BIH', // "Bosnia & Herzegovina" -> & becomes space
  'ivory coast': 'CIV',
  'cote d ivoire': 'CIV', // "Cote d'Ivoire" / "Côte d’Ivoire" after normalize
  'cape verde': 'CPV',
  'cabo verde': 'CPV',
  'dr congo': 'COD',
  'congo dr': 'COD',
  'democratic republic of the congo': 'COD',
  curacao: 'CUW', // "Curaçao" after accent stripping
  'saudi arabia': 'KSA',
  'new zealand': 'NZL',
  'south africa': 'RSA',
}

// Build a normalized lookup from NAME_TO_ID once, then layer aliases on top.
const LOOKUP: Record<string, string> = {}
for (const [name, id] of Object.entries(NAME_TO_ID)) {
  LOOKUP[normalize(name)] = id
}
for (const [name, id] of Object.entries(ALIASES)) {
  LOOKUP[normalize(name)] = id
}

/**
 * Resolve a The Odds API team name to our internal team id.
 * Returns null for unknown names and for the "Draw" outcome.
 */
export function oddsNameToId(name: string): string | null {
  if (!name) return null
  const key = normalize(name)
  if (!key || key === 'draw') return null
  return LOOKUP[key] ?? null
}
