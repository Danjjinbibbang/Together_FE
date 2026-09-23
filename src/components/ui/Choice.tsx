import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/* ── 큰 탭 (화면 24 직접 만들기 / AI로 생성하기) ─────────────── */

export interface BigTabItem<T extends string> {
  value: T
  emoji: string
  label: string
  description: string
}

export function BigTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: BigTabItem<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="tablist" className="mb-5 flex gap-2.5 px-5">
      {items.map((item) => {
        const selected = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex-1 rounded-2xl border-2 p-3.5 text-center',
              selected
                ? 'border-primary bg-primary-tint'
                : 'border-border bg-surface',
            )}
          >
            <span className="block text-xl" aria-hidden>
              {item.emoji}
            </span>
            <span
              className={cn(
                'mt-1 block text-[13px] font-bold',
                selected ? 'text-primary-dark' : 'text-ink',
              )}
            >
              {item.label}
            </span>
            <span className="text-muted mt-0.5 block text-[10.5px]">
              {item.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── 칩 선택 (화면 24 제출 형식) ──────────────────────────────── */

export function ChipGroup<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-2">
      {items.map((item) => {
        const selected = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-xl border-[1.5px] px-4 py-2.5 text-[13px] font-bold',
              selected
                ? 'border-primary bg-primary-tint text-primary-dark'
                : 'border-border bg-surface text-muted',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── 라디오 / 체크 선택 행 ────────────────────────────────────── */

interface SelectableRowProps {
  selected: boolean
  onSelect: () => void
  /** radio: 단일 선택(방장 양도) · check: 다중 선택(AI 미션 고르기) */
  control: 'radio' | 'check'
  disabled?: boolean
  children: ReactNode
  className?: string
}

export function SelectableRow({
  selected,
  onSelect,
  control,
  disabled = false,
  children,
  className,
}: SelectableRowProps) {
  return (
    <button
      type="button"
      role={control === 'radio' ? 'radio' : 'checkbox'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'bg-surface mb-2.5 flex w-full items-center gap-3 rounded-2xl border-[1.5px] p-3.5 text-left disabled:opacity-60',
        selected ? 'border-primary bg-primary-tint/40' : 'border-border',
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>

      {!disabled &&
        (control === 'radio' ? (
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
              selected ? 'border-primary' : 'border-border',
            )}
          >
            {selected && <span className="bg-primary size-2.5 rounded-full" />}
          </span>
        ) : (
          <span
            className={cn(
              'flex size-5.5 shrink-0 items-center justify-center rounded-md text-xs font-extrabold text-white',
              selected ? 'bg-primary' : 'border-border border-[1.5px]',
            )}
          >
            {selected && '✓'}
          </span>
        ))}
    </button>
  )
}
