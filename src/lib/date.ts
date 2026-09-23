const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 연/월(1~12)을 delta개월만큼 이동. 12월 → 1월 같은 연도 넘김을 Date가 처리한다. */
export function shiftMonth(year: number, month: number, delta: number) {
  const moved = new Date(year, month - 1 + delta, 1)
  return { year: moved.getFullYear(), month: moved.getMonth() + 1 }
}

/** 해당 월의 마지막 날짜 (윤년 포함) */
export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

/** 2026-08-19 → '수' */
export function weekdayLabel(year: number, month: number, day: number) {
  return WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()] ?? ''
}

/** 기기 로컬 시각 기준 오늘. month는 1~12로 맞춰서 돌려준다. */
export function getToday() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

/**
 * 시작일부터 오늘까지 며칠째인지 (시작일 당일이 1일째).
 *
 * 시각이 아니라 날짜만 비교한다 — 오후에 시작한 챌린지가 다음 날 아침에 "1일째"로
 * 보이면 어색하기 때문이다. 미래 날짜면 0을 돌려준다.
 */
export function daysSince(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return 0

  const start = new Date(year, month - 1, day)
  const today = getToday()
  const now = new Date(today.year, today.month - 1, today.day)

  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return diff < 0 ? 0 : diff + 1
}

/**
 * 그 달을 펼쳤을 때 기본으로 선택할 날짜.
 * 이번 달이면 오늘, 다른 달이면 1일. (1일은 모든 달에 존재해 말일 예외가 없다)
 */
export function defaultSelectedDay(year: number, month: number) {
  const today = getToday()
  return year === today.year && month === today.month ? today.day : 1
}
