import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SectionLabelProps {
  children: ReactNode
  /** 우측 보조 텍스트 (예: "2개") */
  trailing?: ReactNode
  /** muted: 옅은 회색 소제목 / ink: 진한 본문 소제목 */
  tone?: 'ink' | 'muted'
  className?: string
}

export function SectionLabel({
  children,
  trailing,
  tone = 'ink',
  className,
}: SectionLabelProps) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center justify-between text-[13px] font-extrabold',
        tone === 'ink' ? 'text-ink' : 'text-muted font-bold',
        className,
      )}
    >
      <span>{children}</span>
      {trailing && (
        <span className="text-muted text-xs font-semibold">{trailing}</span>
      )}
    </div>
  )
}
