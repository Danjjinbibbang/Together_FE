import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatWon, toPercent } from '@/lib/format'
import type { ChallengeListItem } from '@/types/api'

/**
 * 챌린지 요약 카드 (화면 03 홈 · 04 챌린지 목록 공용).
 * 두 화면이 같은 마크업을 쓰고 있어 하나로 합쳤다.
 */
export function ChallengeCard({
  challenge,
  onClick,
}: {
  challenge: ChallengeListItem
  onClick?: () => void
}) {
  const { title, memberCount, currentBalance, goalAmount, themeColor } =
    challenge
  const percent = toPercent(currentBalance, goalAmount)

  return (
    <Card
      className="mb-3.5 w-full cursor-pointer text-left"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {/* 사용자가 캘린더에서 정한 개인 색상 (FR-041) */}
          {themeColor && (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: themeColor }}
              aria-hidden
            />
          )}
          <span className="text-ink truncate text-[15px] font-extrabold">
            {title}
          </span>
        </span>
        <Badge tone="primary" size="sm" className="shrink-0">
          {memberCount}명
        </Badge>
      </div>

      <ProgressBar value={percent} className="mb-2" />

      <div className="text-muted flex justify-between text-xs">
        <span>
          {currentBalance.toLocaleString('ko-KR')} / {formatWon(goalAmount)}
        </span>
        <b className="text-primary-dark">{percent}%</b>
      </div>
    </Card>
  )
}
