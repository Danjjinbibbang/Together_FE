import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createChallenge,
  fetchChallenge,
  fetchChallenges,
  fetchInviteCode,
  joinChallenge,
  transferOwner,
  updateChallenge,
  updateMissionMode,
} from '@/api/challenges'
import { queryKeys } from '@/api/queryClient'
import type {
  CreateChallengeRequest,
  ID,
  JoinChallengeRequest,
  TransferOwnerRequest,
  UpdateChallengeRequest,
  UpdateMissionModeRequest,
} from '@/types/api'

/** 내가 속한 챌린지 목록 (화면 03·04) */
export function useChallenges() {
  return useQuery({
    queryKey: queryKeys.challenges(),
    queryFn: fetchChallenges,
  })
}

/** 챌린지 상세 = 그룹 홈 (화면 08) */
export function useChallenge(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.challenge(String(challengeId)),
    queryFn: () => fetchChallenge(challengeId),
    enabled: Number.isFinite(challengeId),
  })
}

/** 초대코드 조회 (화면 06). 잘 안 바뀌는 값이라 오래 캐싱한다. */
export function useInviteCode(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.inviteCode(String(challengeId)),
    queryFn: () => fetchInviteCode(challengeId),
    enabled: Number.isFinite(challengeId),
    staleTime: 5 * 60_000,
  })
}

/** 챌린지 생성 (화면 05) */
export function useCreateChallenge() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateChallengeRequest) => createChallenge(body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.challenges() })
    },
  })
}

/** 챌린지 정보 수정 — 방장 전용 (FR-036, 화면 21) */
export function useUpdateChallenge(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateChallengeRequest) =>
      updateChallenge(challengeId, body),
    onSuccess: () => {
      // 목표 금액이 바뀌면 진행률도 달라지므로 목록까지 함께 무효화한다
      void client.invalidateQueries({
        queryKey: queryKeys.challenge(String(challengeId)),
      })
      void client.invalidateQueries({ queryKey: queryKeys.challenges() })
    },
  })
}

/** 초대코드로 참여 — 닉네임 중복이면 409 (화면 07) */
export function useJoinChallenge(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: JoinChallengeRequest) =>
      joinChallenge(challengeId, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.challenges() })
    },
  })
}

/** 미션 운영 방식 설정 — 방장이 아니면 403 (FR-008, 화면 09) */
export function useUpdateMissionMode(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateMissionModeRequest) =>
      updateMissionMode(challengeId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.challenge(String(challengeId)),
      })
    },
  })
}

/** 방장 양도 — 되돌릴 수 없다 (FR-037, 화면 22) */
export function useTransferOwner(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: TransferOwnerRequest) =>
      transferOwner(challengeId, body),
    onSuccess: () => {
      // 내 역할(myRole)과 멤버들의 role이 동시에 바뀐다
      void client.invalidateQueries({
        queryKey: queryKeys.challenge(String(challengeId)),
      })
      void client.invalidateQueries({
        queryKey: queryKeys.members(String(challengeId)),
      })
    },
  })
}
