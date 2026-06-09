import { GroupId } from '@/lib/types'

export const NAME_TO_ID: Record<string, string> = {
  Mexico: 'MEX',
  'South Africa': 'RSA',
  'South Korea': 'KOR',
  'Czech Republic': 'CZE',
  Canada: 'CAN',
  Switzerland: 'SUI',
  Qatar: 'QAT',
  'Bosnia & Herzegovina': 'BIH',
  Brazil: 'BRA',
  Morocco: 'MAR',
  Scotland: 'SCO',
  Haiti: 'HAI',
  USA: 'USA',
  Australia: 'AUS',
  Paraguay: 'PAR',
  Turkey: 'TUR',
  Germany: 'GER',
  Ecuador: 'ECU',
  'Ivory Coast': 'CIV',
  Curaçao: 'CUW',
  Netherlands: 'NED',
  Japan: 'JPN',
  Tunisia: 'TUN',
  Sweden: 'SWE',
  Belgium: 'BEL',
  Iran: 'IRN',
  Egypt: 'EGY',
  'New Zealand': 'NZL',
  Spain: 'ESP',
  Uruguay: 'URU',
  'Saudi Arabia': 'KSA',
  'Cape Verde': 'CPV',
  France: 'FRA',
  Senegal: 'SEN',
  Norway: 'NOR',
  Iraq: 'IRQ',
  Argentina: 'ARG',
  Austria: 'AUT',
  Algeria: 'ALG',
  Jordan: 'JOR',
  Portugal: 'POR',
  Colombia: 'COL',
  Uzbekistan: 'UZB',
  'DR Congo': 'COD',
  England: 'ENG',
  Croatia: 'CRO',
  Panama: 'PAN',
  Ghana: 'GHA',
}

export interface LiveMatch {
  round: string
  date: string
  group: GroupId | null
  name1: string
  name2: string
  id1: string | null
  id2: string | null
  homeGoals: number | null
  awayGoals: number | null
  finished: boolean
}

const GROUP_RE = /^Group ([A-L])$/

export function parseOpenfootball(raw: unknown): LiveMatch[] {
  if (!raw || typeof raw !== 'object') return []
  const matches = (raw as { matches?: unknown }).matches
  if (!Array.isArray(matches)) return []

  return matches.map((m): LiveMatch => {
    const match = (m ?? {}) as Record<string, unknown>
    const name1 = typeof match.team1 === 'string' ? match.team1 : ''
    const name2 = typeof match.team2 === 'string' ? match.team2 : ''
    const round = typeof match.round === 'string' ? match.round : ''
    const date = typeof match.date === 'string' ? match.date : ''

    const groupRaw = typeof match.group === 'string' ? match.group : ''
    const groupMatch = GROUP_RE.exec(groupRaw)
    const group = (groupMatch ? groupMatch[1] : null) as GroupId | null

    const id1 = NAME_TO_ID[name1] ?? null
    const id2 = NAME_TO_ID[name2] ?? null

    const score = match.score as { ft?: unknown } | undefined
    const ft = score?.ft
    const finished = Array.isArray(ft)
    const homeGoals = finished ? Number(ft[0]) : null
    const awayGoals = finished ? Number(ft[1]) : null

    return { round, date, group, name1, name2, id1, id2, homeGoals, awayGoals, finished }
  })
}

export interface LiveGroupResult {
  a: string
  b: string
  ga: number
  gb: number
  group: GroupId
}

export function liveGroupResults(matches: LiveMatch[]): LiveGroupResult[] {
  const out: LiveGroupResult[] = []
  for (const m of matches) {
    if (
      m.finished &&
      m.group !== null &&
      m.id1 !== null &&
      m.id2 !== null &&
      m.homeGoals !== null &&
      m.awayGoals !== null
    ) {
      out.push({ a: m.id1, b: m.id2, ga: m.homeGoals, gb: m.awayGoals, group: m.group })
    }
  }
  return out
}
