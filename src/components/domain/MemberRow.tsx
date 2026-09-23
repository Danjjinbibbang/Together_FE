import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatWon } from '@/lib/format'
import type { MemberListItem } from '@/types/api'

/** 그룹 홈의 멤버별 계좌 한 줄 (화면 08) */
export function MemberRow({
  member,
  onClick,
}: {
  member: MemberListItem
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border bg-surface mb-2.5 flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left"
    >
      <Avatar name={member.nickname} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-ink truncate text-[13px] font-bold">
            {member.nickname}
          </span>
          {member.role === 'OWNER' && (
            <Badge tone="accentSolid" size="sm">
              방장
            </Badge>
          )}
        </span>
        <span className="text-muted mt-0.5 block text-xs">
          잔액 {formatWon(member.balance)}
        </span>
      </span>
    </button>
  )
}
