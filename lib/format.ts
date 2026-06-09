// Formatting helpers that render absolute UTC timestamps in Spanish peninsular
// time (Europe/Madrid). Used by the group-stage and live views so matches are
// shown and ordered by the hour they kick off in Spain.

const TZ = 'Europe/Madrid'

/** "21:00" in Madrid time, or '' if no kickoff. */
export function timeES(kickoff?: string | null): string {
  if (!kickoff) return ''
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(kickoff))
}

/** "jue 11 jun" in Madrid time (uppercased by callers if desired), or '' . */
export function dayES(kickoff?: string | null): string {
  if (!kickoff) return ''
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: TZ,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
    .format(new Date(kickoff))
    .replace(/\./g, '')
}

/** Sort comparator by kickoff ascending; matches without a kickoff sort last. */
export function byKickoff<T extends { kickoff?: string | null }>(a: T, b: T): number {
  const ka = a.kickoff ?? '￿'
  const kb = b.kickoff ?? '￿'
  return ka < kb ? -1 : ka > kb ? 1 : 0
}
