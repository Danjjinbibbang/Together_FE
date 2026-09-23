import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ID,
  MemberListItem,
  MemberListResponse,
  MyMemberResponse,
  UpdateMyMemberRequest,
  UpdateMyMemberResponse,
} from '@/types/api'

/**
 * 챌린지 내 멤버 목록 (화면 08·22).
 * themeColor는 개인 설정이라 이 응답에 포함되지 않는다 — 본인 것은 fetchMyMember로 받는다.
 */
export async function fetchMembers(challengeId: ID): Promise<MemberListItem[]> {
  const { data } = await apiClient.get<MemberListResponse>(
    ENDPOINTS.members.list(challengeId),
  )
  return data.members
}

/** 내 멤버 정보 — 닉네임·역할·캘린더 색상 */
export async function fetchMyMember(challengeId: ID) {
  const { data } = await apiClient.get<MyMemberResponse>(
    ENDPOINTS.members.me(challengeId),
  )
  return data
}

/** 닉네임·캘린더 색상 수정 (FR-041, FR-042 — 색상은 화면 16b에서 호출) */
export async function updateMyMember(
  challengeId: ID,
  body: UpdateMyMemberRequest,
) {
  const { data } = await apiClient.patch<UpdateMyMemberResponse>(
    ENDPOINTS.members.me(challengeId),
    body,
  )
  return data
}

/**
 * 챌린지 탈퇴 (FR-038). 204라 응답 바디가 없다.
 * 로우를 지우지 않고 상태만 LEFT로 바꾸므로 과거 활동 기록은 보존된다.
 */
export async function leaveChallenge(challengeId: ID) {
  await apiClient.delete(ENDPOINTS.members.me(challengeId))
}
