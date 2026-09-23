/** 12300 → "12,300원" */
export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`
}

/** 부호를 붙인 금액. 회수(-)/지급(+) 구분에 쓴다. */
export function formatSignedWon(amount: number) {
  const sign = amount > 0 ? '+' : ''
  return `${sign}${amount.toLocaleString('ko-KR')}원`
}

/**
 * 보상 범위 표기. 100, 2000 → "100~2,000원"
 * 최솟값과 최댓값이 같으면 범위 대신 단일 금액으로 보여준다.
 */
export function formatWonRange(min: number, max: number) {
  if (min === max) return formatWon(min)
  return `${min.toLocaleString('ko-KR')}~${formatWon(max)}`
}

/** 현재 잔액 / 목표 금액 → 0~100 정수 퍼센트 */
export function toPercent(current: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}
