import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

const notice = cva(
  'rounded-[14px] border border-dashed px-3.5 py-3 text-xs leading-relaxed',
  {
    variants: {
      tone: {
        /** 안내 (기본) */
        accent: 'border-accent bg-accent-tint text-accent-ink',
        /** 규칙 안내 — 파란 글씨 */
        info: 'border-accent bg-accent-tint-2 text-primary-dark',
        /** 경고 */
        danger: 'border-danger bg-danger-tint font-semibold text-[#8A2F2F]',
      },
    },
    defaultVariants: { tone: 'accent' },
  },
)

interface NoticeBoxProps extends VariantProps<typeof notice> {
  children: ReactNode
  className?: string
}

/** 점선 테두리 인라인 배너 (화면 01·05·09·18) */
export function NoticeBox({ tone, className, children }: NoticeBoxProps) {
  return <div className={cn(notice({ tone }), className)}>{children}</div>
}
