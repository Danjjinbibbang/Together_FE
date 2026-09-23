import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const track = cva('w-full overflow-hidden rounded-full', {
  variants: {
    tone: {
      /** 밝은 배경 위 — 챌린지 카드 */
      light: 'bg-track',
      /** 파란 카드 위 — 그룹 홈, 계좌 히어로 */
      onPrimary: 'bg-white/25',
    },
    size: { sm: 'h-2', md: 'h-2.5' },
  },
  defaultVariants: { tone: 'light', size: 'sm' },
})

const fill = cva('h-full rounded-full transition-[width] duration-500', {
  variants: {
    tone: { light: 'bg-primary', onPrimary: 'bg-accent' },
  },
  defaultVariants: { tone: 'light' },
})

interface ProgressBarProps extends VariantProps<typeof track> {
  /** 0~100. 범위를 벗어난 값은 잘라낸다. */
  value: number
  className?: string
}

export function ProgressBar({
  value,
  tone,
  size,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value))

  return (
    <div
      className={cn(track({ tone, size }), className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={fill({ tone })} style={{ width: `${percent}%` }} />
    </div>
  )
}
