import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatWon } from '@/lib/format'
import type { MissionLogListItem } from '@/types/api'

/** 팀 활동 피드 한 건 (화면 26) */
export function FeedItem({
  log,
  isMe,
  onClick,
}: {
  log: MissionLogListItem
  isMe: boolean
  onClick?: () => void
}) {
  // 비공개 미션은 서버가 미리보기를 빼고 내려준다 (FR-016, FR-039)
  const hidden = !log.isPublic || !log.submitContentPreview

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={hidden}
      className="border-border bg-surface mb-3 block w-full rounded-[18px] border p-4 text-left"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <Avatar name={log.nickname} size="sm" tone="solid" />
        <div className="min-w-0 flex-1">
          <p className="text-ink truncate text-[13px] font-bold">
            {log.nickname}
            {isMe && ' (나)'}
          </p>
          <p className="text-muted text-[11px]">{log.missionTitle}</p>
        </div>
        <Badge tone="accent" size="sm">
          🪙 {formatWon(log.rewardAmount)}
        </Badge>
        {hidden && (
          <Badge tone="neutral" size="sm">
            🔒 비공개
          </Badge>
        )}
      </div>

      <p
        className={cn(
          'text-[13px] leading-relaxed',
          hidden ? 'text-muted italic' : 'text-ink',
        )}
      >
        {hidden
          ? '비공개로 작성된 미션이에요. 완료 여부와 보상 금액만 볼 수 있어요.'
          : log.submitContentPreview}
      </p>
    </button>
  )
}

/** 피드의 날짜 구분선 (화면 26) */
export function DayDivider({ children }: { children: string }) {
  return <p className="text-muted mb-3 text-xs font-bold">{children}</p>
}
