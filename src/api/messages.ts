import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ID,
  SendTeamMessageRequest,
  SendTeamMessageResponse,
  TeamMessageListParams,
  TeamMessageListResponse,
} from '@/types/api'

/**
 * 팀 응원 메시지 (FR-044, 2026-08-25 신설).
 *
 * 팀원 누구나 챌린지 전체에 한 줄을 보낸다(1:N). 실시간 채팅이 아니라 단건 발송이고,
 * 받는 쪽은 알림함(화면 15)에서 읽는다 — 실시간 채팅은 v0.4 §6에서 제외된 범위다.
 */

/** 목록 — 최신순 커서 페이지네이션. nextCursor가 없으면 마지막 페이지다. */
export async function fetchTeamMessages(
  challengeId: ID,
  params?: TeamMessageListParams,
) {
  const { data } = await apiClient.get<TeamMessageListResponse>(
    ENDPOINTS.challenges.messages(challengeId),
    { params },
  )
  return data
}

/**
 * 응원 보내기.
 * 200자 초과·빈 문자열이면 400, 하루 5건을 넘기면 429다.
 */
export async function sendTeamMessage(
  challengeId: ID,
  body: SendTeamMessageRequest,
) {
  const { data } = await apiClient.post<SendTeamMessageResponse>(
    ENDPOINTS.challenges.messages(challengeId),
    body,
  )
  return data
}

/**
 * 삭제 — 작성자 본인만(아니면 403). 204라 응답 바디가 없다.
 *
 * 팀원 알림함에서도 흔적 없이 사라지고, 안 읽은 건이었다면 미확인 배지도 함께 줄어든다.
 * 서버에는 원본이 남아(soft delete) 지우고 다시 보내는 식의 한도 우회는 막힌다.
 */
export async function deleteTeamMessage(challengeId: ID, messageId: ID) {
  await apiClient.delete(ENDPOINTS.challenges.message(challengeId, messageId))
}
