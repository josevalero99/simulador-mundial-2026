/** A porra participant and the 4 national teams they own. */
export interface PorraEntry {
  name: string
  teams: string[]
}

/**
 * The default porra: 12 participants, 4 teams each, partitioning all 48 teams.
 * (Best-effort decode of a screenshot; what matters is a valid partition.)
 */
export const DEFAULT_PORRA: PorraEntry[] = [
  { name: 'JUANCAR', teams: ['POR', 'SWE', 'CZE', 'BIH'] },
  { name: 'HERNAN', teams: ['BRA', 'MAR', 'SEN', 'HAI'] },
  { name: 'RAFA', teams: ['ESP', 'CAN', 'CIV', 'CUW'] },
  { name: 'JOSE', teams: ['FRA', 'NOR', 'KSA', 'JOR'] },
  { name: 'MARIO', teams: ['ARG', 'RSA', 'AUS', 'EGY'] },
  { name: 'ALVARO', teams: ['GER', 'JPN', 'KOR', 'NZL'] },
  { name: 'ROBER', teams: ['ENG', 'TUR', 'AUT', 'QAT'] },
  { name: 'JOHN', teams: ['NED', 'USA', 'IRN', 'UZB'] },
  { name: 'JULIO', teams: ['COL', 'URU', 'PAR', 'TUN'] },
  { name: 'JUANBA', teams: ['BEL', 'ECU', 'ALG', 'GHA'] },
  { name: 'PABLO', teams: ['CPV', 'CRO', 'IRQ', 'COD'] },
  { name: 'JAIME', teams: ['SUI', 'MEX', 'SCO', 'PAN'] },
]
