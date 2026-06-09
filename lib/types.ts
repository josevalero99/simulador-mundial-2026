export type Confed = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'
export type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'
export type Matchday = 1 | 2 | 3

export interface Team {
  id: string
  name: string
  flag: string
  confederation: Confed
  pot: 1 | 2 | 3 | 4
  fifaRank: number
}

export interface Match {
  id: string
  group: GroupId
  matchday: Matchday
  date: string
  home: string
  away: string
  homeGoals: number | null
  awayGoals: number | null
}

export interface StandingRow {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
  rank: number
  tiebreakApplied?: string
}
