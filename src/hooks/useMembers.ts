import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMembers,
  fetchMyMember,
  leaveChallenge,
  updateMyMember,
} from '@/api/members'
import { queryKeys } from '@/api/queryClient'
import type { ID, UpdateMyMemberRequest } from '@/types/api'

/**
 * 챌린지 멤버 목록 (화면 08·22).
 *
 * 서버는 탈퇴자(STATUS=LEFT)도 포함해 내려준다. 목록에 남기면 이미 나간 사람의
 * 잔액이 팀 화면에 계속 보이므로, 여기서 걸러 활성 멤버만 돌려준다.
 * 과거 미션 기록·활동 피드의 작성자명은 그대로 남는다(기록 보존).
 */
export function useMembers(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.members(String(challengeId)),
    queryFn: () => fetchMembers(challengeId),
    enabled: Number.isFinite(challengeId),
    select: (members) => members.filter((member) => member.status === 'ACTIVE'),
  })
}

/** 내 멤버 정보 — 닉네임·역할·캘린더 색상 */
export function useMyMember(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.myMember(String(challengeId)),
    queryFn: () => fetchMyMember(challengeId),
    enabled: Number.isFinite(challengeId),
  })
}

/** 닉네임·캘린더 색상 수정 (FR-041, FR-042) */
export function useUpdateMyMember(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateMyMemberRequest) =>
      updateMyMember(challengeId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.myMember(String(challengeId)),
      })
      // 닉네임이 바뀌면 멤버 목록 표시도 달라진다
      void client.invalidateQueries({
        queryKey: queryKeys.members(String(challengeId)),
      })
      // 캘린더 색상은 챌린지 목록 응답의 themeColor에도 실려 온다
      void client.invalidateQueries({ queryKey: queryKeys.challenges() })
    },
  })
}

/**
 * 챌린지 탈퇴 (FR-038).
 * 방장은 양도 전까지 탈퇴할 수 없다 — 서버가 409로 막는다.
 */
export function useLeaveChallenge(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: () => leaveChallenge(challengeId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.challenges() })
      client.removeQueries({
        queryKey: queryKeys.challenge(String(challengeId)),
      })
    },
  })
}
