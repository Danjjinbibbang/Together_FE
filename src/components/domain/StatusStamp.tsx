import { Badge, type BadgeProps } from '@/components/ui/Badge'
import { REJECT_REASON_LABEL } from '@/lib/missionLog'
import type {
  MissionLogStatus,
  RejectReasonCode,
  ReviewedBy,
} from '@/types/api'

/**
 * 미션 승인 상태 8단계 표시 (와이어프레임 12·14 "승인상태 뱃지 시스템 v2").
 * 상태 이름은 API 명세(MissionLogStatus)를 그대로 따른다.
 */

const STATUS_MAP: Record<
  MissionLogStatus,
  { label: string; icon: string; tone: BadgeProps['tone']; className?: string }
> = {
  SUBMITTED: {
    label: '제출됨',
    icon: '📤',
    tone: 'neutral',
    className: 'border-[#C7CFD6] bg-[#EFEAE1] text-[#52606D]',
  },
  AI_APPROVED: {
    label: 'AI 승인',
    icon: '🤖',
    tone: 'ai',
    className: 'border-[#C9B8F7]',
  },
  AI_REJECTED: {
    label: 'AI 반려',
    icon: '🤖',
    tone: 'danger',
    className: 'border-[#F0C6BE] bg-[#FBEDEA]',
  },
  DISPUTE_REQUESTED: {
    label: '이의제기중',
    icon: '🙋',
    tone: 'accent',
    className: 'bg-accent-tint-2',
  },
  RECHECK_REQUESTED: {
    label: '재검토 요청',
    icon: '🔁',
    tone: 'accent',
    className: 'bg-accent-tint-2',
  },
  RESUBMITTED: {
    label: '재제출됨',
    icon: '✏️',
    tone: 'accent',
    className: 'bg-accent-tint-2',
  },
  OWNER_APPROVED: {
    label: '방장 승인',
    icon: '👑',
    tone: 'primary',
    className: 'border-primary bg-[#EAF4EE]',
  },
  OWNER_REJECTED: {
    label: '방장 반려',
    icon: '👑',
    tone: 'danger',
    className: 'border-danger bg-[#FBEDEA]',
  },
}

export function StatusStamp({
  status,
  className,
}: {
  status: MissionLogStatus
  className?: string
}) {
  const { label, icon, tone, className: toneClass } = STATUS_MAP[status]

  return (
    <Badge
      tone={tone}
      outline
      className={`${toneClass ?? ''} ${className ?? ''}`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </Badge>
  )
}

const REVIEWER_MAP: Record<
  ReviewedBy,
  { icon: string; label: string; tone: BadgeProps['tone'] }
> = {
  AI: { icon: '🤖', label: 'AI가 판정함', tone: 'ai' },
  OWNER: { icon: '👑', label: '방장이 판정함', tone: 'primary' },
  // 방장이 72시간 넘게 응답하지 않아 자동 승인된 경우 (2026-08-25 신설)
  AUTO: { icon: '⏱', label: '자동 승인됨', tone: 'primary' },
}

/**
 * 누가 판정했는지 표시하는 태그. 오탐 원인이 있으면 뒤에 붙여 보여준다.
 * (예: "🤖 AI가 판정함 · 화질 불량")
 */
export function ReviewerTag({
  reviewer,
  reason,
}: {
  reviewer: ReviewedBy
  reason?: RejectReasonCode
}) {
  const { icon, label, tone } = REVIEWER_MAP[reviewer]

  return (
    <Badge tone={tone} size="md">
      <span aria-hidden>{icon}</span>
      {label}
      {reason && ` · ${REJECT_REASON_LABEL[reason]}`}
    </Badge>
  )
}
