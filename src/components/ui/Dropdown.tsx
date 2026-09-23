import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface DropdownItem {
  icon: string
  label: string
  onClick?: () => void
  tone?: 'default' | 'danger'
  /** 신규 기능 강조 (배경 강조 + NEW 뱃지) */
  isNew?: boolean
}

/**
 * 상단바 ⋮ 메뉴에서 펼쳐지는 드롭다운 (화면 08).
 * MobileFrame 기준 absolute이므로 프레임 밖으로 새지 않는다.
 */
export function Dropdown({
  open,
  onClose,
  items,
}: {
  open: boolean
  onClose: () => void
  items: DropdownItem[]
}): ReactNode {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="absolute inset-0 z-10"
      />
      <div
        role="menu"
        className="border-border bg-surface absolute top-19 right-5 z-20 w-50 overflow-hidden rounded-2xl border shadow-[0_12px_30px_rgba(0,0,0,.15)]"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
            className={cn(
              'border-border flex w-full items-center gap-2.5 border-b px-4 py-3.5 text-[13px] font-semibold last:border-b-0',
              item.tone === 'danger' ? 'text-danger' : 'text-ink',
              item.isNew && 'bg-[#FBF3E4]',
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
            {item.isNew && (
              <span className="bg-danger ml-auto rounded-[5px] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
