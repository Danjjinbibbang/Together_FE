import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface ListRowProps {
  /** 좌측 아이콘. 문자열(이모지) 또는 노드 */
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** 우측 영역. 미지정 시 onClick이 있으면 › 화살표가 붙는다. */
  trailing?: ReactNode
  onClick?: () => void
  tone?: 'default' | 'danger'
  className?: string
}

/**
 * 아이콘 + 제목/설명 + 우측 요소로 구성된 목록 한 줄.
 * 마이페이지 메뉴, 바텀시트 옵션, 드롭다운 항목이 모두 이 형태를 공유한다.
 */
export function ListRow({
  icon,
  title,
  description,
  trailing,
  onClick,
  tone = 'default',
  className,
}: ListRowProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex w-full items-center gap-3 text-left',
        tone === 'danger' ? 'text-danger' : 'text-ink',
        className,
      )}
    >
      {icon != null && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold">
          {title}
        </span>
        {description && (
          <span className="text-muted mt-0.5 block text-[11.5px] font-normal">
            {description}
          </span>
        )}
      </span>
      {trailing ?? (onClick && <span className="text-muted">›</span>)}
    </Tag>
  )
}

/** ListRow들을 묶는 카드형 그룹 (마이페이지 메뉴 묶음) */
export function ListGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-surface overflow-hidden rounded-[18px] border',
        '[&>*]:border-border [&>*]:border-b [&>*]:px-4 [&>*]:py-4 [&>*:last-child]:border-b-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
