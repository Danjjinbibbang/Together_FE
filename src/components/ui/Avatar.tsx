import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const avatar = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
  {
    variants: {
      tone: {
        /** 파란 채움 — 본인/작성자 */
        solid: 'bg-primary text-white',
        /** 옅은 파랑 — 멤버 목록 */
        soft: 'bg-[#E4F2FC] text-primary-dark',
      },
      size: {
        xs: 'size-[30px] text-[11px]',
        sm: 'size-9 text-xs',
        md: 'size-[38px] text-[13px]',
        lg: 'size-13 text-lg',
        xl: 'size-22 text-3xl',
      },
    },
    defaultVariants: { tone: 'soft', size: 'md' },
  },
)

interface AvatarProps extends VariantProps<typeof avatar> {
  /** 닉네임. 첫 글자를 이니셜로 표시한다. */
  name: string
  className?: string
}

export function Avatar({ name, tone, size, className }: AvatarProps) {
  return (
    <span
      className={cn(avatar({ tone, size }), className)}
      aria-hidden
      title={name}
    >
      {[...name][0] ?? '?'}
    </span>
  )
}
