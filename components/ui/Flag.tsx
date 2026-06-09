import { TEAMS } from '@/lib/data/teams'

interface FlagProps {
  teamId: string
  className?: string
}

/** Renders a team's flag emoji with an accessible label. */
export default function Flag({ teamId, className }: FlagProps) {
  const team = TEAMS[teamId]
  const flag = team?.flag ?? '🏳️'
  const label = team?.name ?? teamId
  return (
    <span
      role="img"
      aria-label={label}
      className={className}
    >
      {flag}
    </span>
  )
}
