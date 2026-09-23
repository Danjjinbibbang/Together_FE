import { cn } from '@/lib/cn'
import type { NotificationItem, NotificationType } from '@/types/api'

/**
 * 알림 종류별 표시 규칙 (백엔드 §13에서 3종으로 확정).
 * 본문(content)은 서버가 완성해 내려주므로 프론트는 아이콘과 강조만 담당한다.
 */
const NOTIFICATION_STYLE: Record<
  NotificationType,
  { icon: string; tone: string }
> = {
  MISSION_REWARD: { icon: '🪙', tone: 'bg-primary-tint' },
  MISSION_REJECTED: { icon: '🤖', tone: 'bg-ai-tint' },
  MISSION_DISPUTED: { icon: '🙋', tone: 'bg-accent-tint' },
  TEAM_GOAL_ACHIEVED: { icon: '🎊', tone: 'bg-accent-tint' },
  TEAM_CHEER: { icon: '📣', tone: 'bg-primary-tint' },
}

/** "2026-08-19T09:15:00" → "5분 전" 같은 상대 시각 */
function formatRelativeTime(isoDateTime: string) {
  const time = new Date(isoDateTime).getTime()
  if (Number.isNaN(time)) return ''

  const minutes = Math.floor((Date.now() - time) / 60_000)
  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  const days = Math.floor(hours / 24)
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`

  return new Date(time).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })
}

/** 알림함 한 줄 (화면 15) */
export function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationItem
  onClick?: () => void
}) {
  const style = NOTIFICATION_STYLE[notification.type]
  const canOpen = notification.targetId != null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canOpen}
      className={cn(
        'border-border flex w-full items-start gap-3 border-b py-3.5 text-left',
        // 안 읽은 알림은 좌우 패딩만큼 배경을 넓혀 목록에서 도드라지게 한다
        !notification.isRead && '-mx-5 bg-[#F5FAFF] px-5',
      )}
    >
      <span
        className={cn(
          'flex size-9.5 shrink-0 items-center justify-center rounded-xl text-base',
          style?.tone ?? 'bg-track',
        )}
        aria-hidden
      >
        {style?.icon ?? '🔔'}
      </span>

      <span className="flex-1">
        <span className="text-ink block text-[13px] leading-normal">
          {notification.content}
        </span>
        <span className="text-muted mt-1 block text-[11px]">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>

      {!notification.isRead && (
        <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
      )}
    </button>
  )
}
