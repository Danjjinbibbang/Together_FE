import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { cn } from '@/lib/cn'
import { THEME_COLORS } from '@/lib/themeColors'

interface ColorPickerSheetProps {
  open: boolean
  onClose: () => void
  /** 색을 지정할 챌린지 (예: "✈️ 제주도 여행 저축 모임") */
  challengeLabel: string
  value: string
  onChange: (color: string) => void
  onSave: () => void
}

/** 캘린더 색상 선택 바텀시트 (화면 16b) */
export function ColorPickerSheet({
  open,
  onClose,
  challengeLabel,
  value,
  onChange,
  onSave,
}: ColorPickerSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} className="px-6">
      <h2 className="text-ink text-[15px] font-extrabold">
        캘린더 색상 정하기
      </h2>
      <p className="text-muted mt-1 text-xs">이 색상은 나한테만 보여요</p>

      <span className="text-ink mt-3 mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#F0F3F6] px-3 py-1.5 text-xs font-bold">
        {challengeLabel}
      </span>

      <div className="mb-6 grid grid-cols-5 gap-3.5">
        {THEME_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`색상 ${color}`}
            aria-pressed={value === color}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={cn(
              'flex aspect-square w-full items-center justify-center rounded-full border-[3px] text-base font-extrabold text-white',
              value === color ? 'border-ink' : 'border-transparent',
            )}
          >
            {value === color && '✓'}
          </button>
        ))}
      </div>

      <p className="text-muted mb-5 text-center text-[11px] leading-relaxed">
        💡 다른 챌린지에서 이미 쓰고 있는 색상도 선택할 수 있어요. 팀원에게는
        보이지 않는 나만의 설정이에요.
      </p>

      <Button onClick={onSave}>저장하기</Button>
    </BottomSheet>
  )
}
