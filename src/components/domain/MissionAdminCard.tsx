import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/cn'
import { formatWonRange } from '@/lib/format'
import type { MissionListItem } from '@/types/api'

/**
 * 미션 관리 목록의 미션 카드 (화면 23).
 * 비활성 미션도 목록에 함께 오므로 흐리게 구분해 보여준다.
 */
export function MissionAdminCard({
  mission,
  onToggleActive,
  onClick,
  disabled = false,
}: {
  mission: MissionListItem
  onToggleActive: (isActive: boolean) => void
  onClick?: () => void
  disabled?: boolean
}) {
  const formatLabel = mission.submitType === 'TEXT' ? '텍스트' : '사진'

  return (
    <div
      className={cn(
        'border-border bg-surface mb-3.5 rounded-[20px] border p-[18px]',
        !mission.isActive && 'opacity-55',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-ink truncate text-sm font-extrabold">
            {mission.title}
          </p>
          <Badge
            tone={mission.createdByType === 'AI' ? 'ai' : 'neutral'}
            size="sm"
            className="mt-1.5"
          >
            {mission.createdByType === 'AI' ? '✨ AI 생성' : '👤 방장 생성'}
          </Badge>
        </button>

        <Toggle
          checked={mission.isActive}
          onChange={onToggleActive}
          label={`${mission.title} 활성화`}
          className={disabled ? 'pointer-events-none opacity-50' : undefined}
        />
      </div>

      <div className="text-muted flex items-center gap-3 text-[11.5px]">
        <span className="text-accent-ink font-bold">
          🪙 {formatWonRange(mission.rewardMin, mission.rewardMax)}
        </span>
        <span>{formatLabel}</span>
      </div>
    </div>
  )
}

/** 활성/비활성 개수 요약 (화면 23 상단) */
export function StatRow({
  stats,
}: {
  stats: { label: string; value: number }[]
}) {
  return (
    <div className="mb-5 flex gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-border bg-surface flex-1 rounded-2xl border p-4 text-center"
        >
          <p className="text-ink text-[22px] font-extrabold">{stat.value}</p>
          <p className="text-muted mt-0.5 text-[11.5px]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
