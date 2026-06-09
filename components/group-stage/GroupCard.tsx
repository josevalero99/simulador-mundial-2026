import type { GroupId } from '@/lib/types'
import StandingsTable from './StandingsTable'
import FixtureList from './FixtureList'

interface GroupCardProps {
  groupId: GroupId
}

/** A card with the group header, live standings and the group's fixtures. */
export default function GroupCard({ groupId }: GroupCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#16161c]/55 backdrop-blur-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#2A398D] text-sm font-bold text-white">
          {groupId}
        </span>
        <h3 className="text-base font-semibold text-[#f5f5f5]">Grupo {groupId}</h3>
      </div>

      <StandingsTable groupId={groupId} />

      <div className="mt-4 border-t border-white/10 pt-3">
        <FixtureList groupId={groupId} />
      </div>
    </div>
  )
}
