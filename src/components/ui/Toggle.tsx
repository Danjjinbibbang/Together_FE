import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** 스크린리더용 라벨. ToggleRow를 쓰면 자동으로 채워진다. */
  label: string
  className?: string
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6.5 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-track',
        className,
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] size-5 rounded-full bg-white shadow-sm transition-[left]',
          checked ? 'left-[21px]' : 'left-[3px]',
        )}
      />
    </button>
  )
}

interface ToggleRowProps {
  title: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** 제목 + 설명 + 스위치 한 줄 (화면 11 공개 여부 설정) */
export function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="border-border bg-surface flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5">
      <div>
        <p className="text-ink text-[13px] font-bold">{title}</p>
        {description && (
          <p className="text-muted mt-0.5 text-[11px]">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}
