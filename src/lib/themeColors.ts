/**
 * 캘린더 챌린지 색상 팔레트 10색 (FR-041).
 *
 * 중복 지정 허용 여부는 요구사항정의서 v0.4 §4 신규 미확정 사항이다.
 * 와이어프레임 16b의 안내 문구가 "중복 선택 가능"이라 현재는 허용으로 둔다.
 */
export const THEME_COLORS = [
  '#18A8F1',
  '#FF7A59',
  '#22C58B',
  '#8B5CF6',
  '#EC4899',
  '#14B8B0',
  '#F43F5E',
  '#A16207',
  '#64748B',
  '#FFBE0F',
] as const

export const DEFAULT_THEME_COLOR = THEME_COLORS[0]
