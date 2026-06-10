import { H2H, FORM, type FormMatch, type H2HMeeting, type H2HRecord } from './comparadorData'

export interface H2HView {
  played: number
  winsA: number
  draws: number
  winsB: number
  last: H2HMeeting[]
}

/** Clave de par ordenada alfabéticamente por id. */
export function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`
}

/** Normaliza un H2HRecord (en orden lo/hi) a la perspectiva de A. null si no hay partidos. */
export function viewH2H(rec: H2HRecord | undefined, idA: string, idB: string): H2HView | null {
  if (!rec || rec.played === 0) return null
  const aIsLo = idA < idB
  return {
    played: rec.played,
    winsA: aIsLo ? rec.winsLo : rec.winsHi,
    draws: rec.draws,
    winsB: aIsLo ? rec.winsHi : rec.winsLo,
    last: rec.last,
  }
}

/** Head-to-head entre A y B desde la perspectiva de A. null si no hay datos. */
export function getH2H(idA: string, idB: string): H2HView | null {
  return viewH2H(H2H[pairKey(idA, idB)], idA, idB)
}

/** Últimos 5 partidos del equipo (más reciente primero); [] si no hay datos. */
export function getForm(teamId: string): FormMatch[] {
  return FORM[teamId] ?? []
}
