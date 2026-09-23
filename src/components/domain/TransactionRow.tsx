import { cn } from '@/lib/cn'
import { formatSignedWon } from '@/lib/format'
import type { TransactionItem, TransactionType } from '@/types/api'

const KIND_LABEL: Record<TransactionType, string> = {
  MISSION_REWARD: '미션 보상',
  REVERSAL: '회수',
  RE_PAYMENT: '재지급',
}

/** "2026-08-19T09:15:00" → "8/19" */
function formatShortDate(isoDateTime: string) {
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 계좌 상세의 입금 히스토리 한 줄 (화면 13).
 * 재판정으로 생긴 회수(REVERSAL)·재지급(RE_PAYMENT)도 같은 목록에 섞여 온다 (FR-012d).
 */
export function TransactionRow({
  tx,
  /** 거래가 가리키는 미션 제목. 목록 API가 제목을 주지 않아 호출부에서 채워 넣는다. */
  title,
}: {
  tx: TransactionItem
  title?: string
}) {
  const isReversal = tx.type === 'REVERSAL'

  return (
    <li className="border-border flex items-center gap-3 border-b py-3">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl text-base',
          isReversal ? 'bg-danger-tint' : 'bg-accent-tint',
        )}
        aria-hidden
      >
        {isReversal ? '↩️' : '🪙'}
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-ink block truncate text-[13px] font-bold">
          {title ?? KIND_LABEL[tx.type]}
        </span>
        <span className="text-muted mt-0.5 block text-[11px]">
          {formatShortDate(tx.createdAt)} · {KIND_LABEL[tx.type]}
        </span>
      </span>

      <span
        className={cn(
          'shrink-0 text-sm font-extrabold',
          isReversal ? 'text-danger' : 'text-primary-dark',
        )}
      >
        {formatSignedWon(tx.amount)}
      </span>
    </li>
  )
}
