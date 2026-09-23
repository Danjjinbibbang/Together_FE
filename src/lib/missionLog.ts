import type { RejectReasonCode } from '@/types/api'

/**
 * 반려 사유 코드 → 사용자에게 보여줄 문구 (FR-012e).
 * 서버는 코드만 내려주므로 한글 문구는 프론트가 갖는다.
 */
export const REJECT_REASON_LABEL: Record<RejectReasonCode, string> = {
  LOW_QUALITY: '화질 불량',
  LOW_LIGHT: '조도 부족',
  OFF_TOPIC: '주제 무관',
  ETC: '기타',
}
