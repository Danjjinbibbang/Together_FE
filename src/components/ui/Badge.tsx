import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-track text-muted',
        primary: 'bg-primary-tint text-primary-dark',
        accent: 'bg-accent-tint text-accent-ink',
        accentSolid: 'bg-accent text-white',
        danger: 'bg-danger-tint text-danger',
        success: 'bg-success-tint text-success',
        ai: 'bg-ai-tint text-ai',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-[11px]',
        lg: 'px-3.5 py-1.5 text-xs',
      },
      /** 승인 상태 스탬프는 점선 테두리를 쓴다 (화면 12·14) */
      outline: { true: 'border-[1.5px] border-dashed', false: '' },
    },
    defaultVariants: { tone: 'neutral', size: 'md', outline: false },
  },
)

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode
  className?: string
}

export function Badge({
  tone,
  size,
  outline,
  className,
  children,
}: BadgeProps) {
  return (
    <span className={cn(badge({ tone, size, outline }), className)}>
      {children}
    </span>
  )
}
