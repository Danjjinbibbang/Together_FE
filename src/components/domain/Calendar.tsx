import { cn } from '@/lib/cn'
import { daysInMonth } from '@/lib/date'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

export interface CalendarMark {
  /** 1~31 */
  day: number
  /** 그날 미션을 수행한 챌린지들의 색 (챌린지별 색상 점) */
  colors: string[]
}

interface CalendarGridProps {
  year: number
  /** 1~12 */
  month: number
  marks: CalendarMark[]
  selectedDay?: number
  onSelectDay?: (day: number) => void
  onPrevMonth?: () => void
  onNextMonth?: () => void
}

/** 월간 캘린더 (화면 16). 날짜별로 챌린지 색 점을 찍는다. */
export function CalendarGrid({
  year,
  month,
  marks,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const dayCount = daysInMonth(year, month)
  const leadingBlanks = new Date(year, month - 1, 1).getDay()
  const markByDay = new Map(marks.map((mark) => [mark.day, mark.colors]))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={onPrevMonth}
          className="text-muted px-2 text-base"
        >
          ‹
        </button>
        <p className="text-ink text-[15px] font-extrabold">
          {year}년 {month}월
        </p>
        <button
          type="button"
          aria-label="다음 달"
          onClick={onNextMonth}
          className="text-muted px-2 text-base"
        >
          ›
        </button>
      </div>

      <div className="text-muted mb-2 grid grid-cols-7 text-center text-[11px]">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}

        {Array.from({ length: dayCount }, (_, index) => {
          const day = index + 1
          const colors = markByDay.get(day)
          const isDone = colors != null && colors.length > 0

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay?.(day)}
              aria-pressed={selectedDay === day}
              className={cn(
                'border-border bg-surface text-ink flex aspect-square flex-col items-center justify-center rounded-xl border text-xs',
                isDone && 'bg-[#F5F8FB] font-bold',
                selectedDay === day &&
                  'outline-primary-dark outline-2 outline-offset-2',
              )}
            >
              {day}
              {isDone && (
                <span className="mt-0.5 flex gap-[3px]">
                  {colors.map((color) => (
                    <span
                      key={color}
                      className="size-[5px] rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 캘린더 아래 챌린지 색상 범례 */
export function CalendarLegend({
  items,
}: {
  items: { name: string; color: string }[]
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {items.map((item) => (
        <span
          key={item.name}
          className="text-muted flex items-center gap-1.5 text-[11px] font-semibold"
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.name}
        </span>
      ))}
    </div>
  )
}

/** 연속 기록 카드 (화면 16) */
export function StreakCard({ days }: { days: number }) {
  return (
    <div className="from-accent text-accent-ink-strong mt-6 flex items-center justify-between rounded-[18px] bg-gradient-to-br to-[#FFD668] p-4">
      <span className="text-xs font-bold">🔥 전체 활동 연속일</span>
      <span className="text-[22px] font-extrabold">{days}일째</span>
    </div>
  )
}
