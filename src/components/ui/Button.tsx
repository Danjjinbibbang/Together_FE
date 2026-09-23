import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

const button = cva(
  'inline-flex items-center justify-center gap-2 text-center font-bold transition-opacity active:opacity-80 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        /** 주요 행동 — 파란 채움 (제출하기, 챌린지 만들기) */
        primary: 'bg-primary text-white',
        /** 강조 행동 — 노란 채움 (미션 시작하기, 그룹 홈으로 이동) */
        accent: 'bg-accent text-accent-ink-strong',
        /** 보조 행동 — 흰 배경 + 테두리 (계좌 상세 보기, 취소) */
        ghost: 'border-[1.5px] border-border bg-surface text-ink',
        /** 옅은 파란 배경 (코드 확인) */
        soft: 'bg-primary-tint text-primary-dark',
        /** 파괴적 행동 (탈퇴하기) */
        danger: 'bg-danger text-white',
        /** 카카오 로그인 전용 */
        kakao: 'bg-[#FEE500] text-[#3C1E1E]',
      },
      size: {
        /** 화면 하단 주요 CTA */
        lg: 'w-full rounded-2xl px-4 py-4 text-[15px]',
        /** 카드 내부 버튼 · 2분할 버튼 */
        md: 'rounded-xl px-4 py-3.5 text-[13px]',
        /** 인라인 소형 버튼 */
        sm: 'rounded-xl px-4.5 py-2.5 text-[12.5px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  children: ReactNode
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(button({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
