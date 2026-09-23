import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

/**
 * 하단에서 올라오는 시트 (화면 03b).
 * frame 안에 absolute로 깔리므로, 부모에 `relative`가 있어야 한다 — MobileFrame이 이를 보장한다.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 z-20 bg-[#0F1720]/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'safe-bottom bg-surface absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] px-5 pt-3 pb-8',
          'shadow-[0_-10px_30px_rgba(0,0,0,.15)]',
          className,
        )}
      >
        <div className="bg-border mx-auto mb-5 h-1 w-10 rounded-full" />
        {title && (
          <h2 className="text-ink mb-4 text-[15px] font-extrabold">{title}</h2>
        )}
        {children}
      </div>
    </>
  )
}

interface SheetOptionProps {
  icon: ReactNode
  /** 아이콘 배경색 톤 */
  tone?: 'primary' | 'accent'
  title: string
  description: string
  onClick?: () => void
}

/** 바텀시트 안의 큰 선택 항목 (새 챌린지 만들기 / 초대코드로 참여하기) */
export function SheetOption({
  icon,
  tone = 'primary',
  title,
  description,
  onClick,
}: SheetOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border mb-3 flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] p-4 text-left"
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-[14px] text-xl',
          tone === 'primary' ? 'bg-primary-tint' : 'bg-accent-tint',
        )}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="text-ink block text-sm font-bold">{title}</span>
        <span className="text-muted mt-0.5 block text-[11.5px]">
          {description}
        </span>
      </span>
      <span className="text-muted">›</span>
    </button>
  )
}
