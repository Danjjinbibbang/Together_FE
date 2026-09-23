import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import type { CommentItem as CommentDto, ReactionType } from '@/types/api'

/** 화면 14에 노출되는 리액션 4종과 이모지 매핑 */
const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'CLAP', emoji: '👏', label: '짝짝짝' },
  { type: 'FIRE', emoji: '🔥', label: '멋져요' },
  { type: 'MUSCLE', emoji: '💪', label: '힘내요' },
  { type: 'HEART', emoji: '😍', label: '좋아요' },
]

interface ReactionBarProps {
  /** 타입별 개수. 0인 항목은 응답에서 빠질 수 있다. */
  counts: Partial<Record<ReactionType, number>>
  /** 내가 남긴 반응. 없으면 null */
  myReaction: ReactionType | null
  onSelect?: (type: ReactionType) => void
  disabled?: boolean
}

/**
 * 이모지 리액션 줄 (화면 14).
 *
 * 멤버당 반응은 최대 1개다 — 서버가 UNIQUE(missionLogId, memberId)로 강제한다.
 * 그래서 여러 개를 동시에 누르는 게 아니라 라디오처럼 하나만 선택되며,
 * 이미 고른 걸 다시 누르면 해제된다.
 */
export function ReactionBar({
  counts,
  myReaction,
  onSelect,
  disabled = false,
}: ReactionBarProps) {
  return (
    <div
      className="mb-6 flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="리액션"
    >
      {REACTIONS.map(({ type, emoji, label }) => {
        const picked = myReaction === type
        const count = counts[type] ?? 0

        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={picked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onSelect?.(type)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-2 text-[13px] font-bold transition-colors disabled:opacity-50',
              picked
                ? 'border-primary bg-primary-tint text-primary-dark'
                : 'border-border bg-surface text-ink',
            )}
          >
            <span aria-hidden>{emoji}</span>
            {count > 0 && count}
          </button>
        )
      })}
    </div>
  )
}

/** 댓글 한 줄 — 아바타 + 말풍선 (화면 14) */
export function CommentItem({
  comment,
  /** 삭제는 작성자 본인만 가능하다 — 아니면 서버가 403을 준다 */
  canDelete = false,
  onDelete,
}: {
  comment: CommentDto
  canDelete?: boolean
  onDelete?: () => void
}) {
  return (
    <li className="mb-4 flex gap-2.5">
      <Avatar name={comment.nickname} size="xs" tone="solid" />
      <div className="border-border bg-surface text-ink flex-1 rounded-[14px] border px-3.5 py-2.5 text-[12.5px]">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs font-bold">{comment.nickname}</p>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`${comment.nickname}님의 댓글 삭제`}
              className="text-muted shrink-0 text-[11px]"
            >
              삭제
            </button>
          )}
        </div>
        {comment.content}
      </div>
    </li>
  )
}
