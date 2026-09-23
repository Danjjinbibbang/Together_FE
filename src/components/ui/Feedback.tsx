import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/* ── 토스트 (화면 18) ─────────────────────────────────────────── */

const toast = cva(
  'flex items-center gap-2.5 rounded-[14px] px-4 py-3.5 text-[13px] font-semibold text-white',
  {
    variants: {
      tone: {
        neutral: 'bg-toast',
        success: 'bg-primary-dark',
        error: 'bg-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

interface ToastProps extends VariantProps<typeof toast> {
  children: ReactNode
  className?: string
}

export function Toast({ tone, className, children }: ToastProps) {
  return (
    <div role="status" className={cn(toast({ tone }), className)}>
      {children}
    </div>
  )
}

/* ── 확인 얼럿 (화면 18) ──────────────────────────────────────── */

interface AlertDialogProps {
  icon: ReactNode
  title: string
  description?: string
  cancelText?: string
  confirmText: string
  /** 되돌릴 수 없는 행동이면 확인 버튼을 빨갛게 */
  destructive?: boolean
  onCancel?: () => void
  onConfirm?: () => void
  className?: string
}

export function AlertDialog({
  icon,
  title,
  description,
  cancelText = '취소',
  confirmText,
  destructive = false,
  onCancel,
  onConfirm,
  className,
}: AlertDialogProps) {
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className={cn(
        'bg-surface rounded-[20px] p-[22px] text-center shadow-[0_12px_30px_rgba(0,0,0,.08)]',
        className,
      )}
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h2 className="text-ink mb-2 text-base font-extrabold">{title}</h2>
      {description && (
        <p className="text-muted mb-4.5 text-[12.5px] leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="md"
          className="flex-1 border-0 bg-[#F0F3F6]"
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          variant={destructive ? 'danger' : 'primary'}
          size="md"
          className="flex-1"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </div>
  )
}

/* ── 빈 상태 (화면 04·16) ─────────────────────────────────────── */

interface EmptyStateProps {
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ children, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border text-muted rounded-[20px] border-[1.5px] border-dashed p-6 text-center text-[13px] leading-relaxed',
        className,
      )}
    >
      {children}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/* ── 로딩 스피너 (화면 20) ────────────────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className={cn(
        'border-border border-t-primary size-13 animate-spin rounded-full border-[5px]',
        className,
      )}
    />
  )
}
