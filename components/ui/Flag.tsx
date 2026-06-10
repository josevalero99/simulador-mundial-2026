import { TEAMS } from '@/lib/data/teams'
import { isoOf } from '@/lib/data/flags'

interface FlagProps {
  teamId: string
  className?: string
}

/**
 * Bandera circular (SVG de circle-flags servido desde /flags). Tamaño = 1em,
 * así escala con el font-size del contexto igual que hacía el emoji. Si no hay
 * código ISO conocido, cae al emoji del equipo (último recurso: 🏳️).
 */
export default function Flag({ teamId, className }: FlagProps) {
  const team = TEAMS[teamId]
  const label = team?.name ?? teamId
  const iso = isoOf(teamId)

  if (!iso) {
    return (
      <span role="img" aria-label={label} className={className}>
        {team?.flag ?? '🏳️'}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${iso}.svg`}
      alt={label}
      className={['inline-block h-[1em] w-[1em] shrink-0 rounded-full align-[-0.125em]', className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
