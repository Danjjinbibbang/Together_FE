import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

const card = cva('', {
  variants: {
    variant: {
      /** 기본 흰 카드 — 목록 아이템, 폼 블록 */
      surface: 'border border-border bg-surface',
      /** 파란 그라데이션 히어로 — 합산 잔액, 계좌 잔액 */
      hero: 'bg-gradient-to-br from-primary to-primary-dark text-white',
      /** 단색 파랑 — 그룹 홈 진행률, 미션 배너 */
      primary: 'bg-primary text-white',
      /** 점선 강조 — 안내/초대코드 박스 */
      dashed: 'border-[1.5px] border-dashed border-accent bg-accent-tint',
    },
    padding: {
      none: 'p-0',
      md: 'p-4',
      lg: 'p-[18px]',
      xl: 'p-[22px]',
    },
    radius: {
      md: 'rounded-[18px]',
      lg: 'rounded-[20px]',
      xl: 'rounded-[22px]',
    },
  },
  defaultVariants: { variant: 'surface', padding: 'lg', radius: 'lg' },
})

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof card> {
  children: ReactNode
}

export function Card({
  variant,
  padding,
  radius,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(card({ variant, padding, radius }), className)}
      {...props}
    >
      {children}
    </div>
  )
}
