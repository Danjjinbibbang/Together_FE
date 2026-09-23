import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/api/queryClient'
import {
  createMission,
  fetchMissions,
  fetchTodayMission,
  generateAiMissions,
  submitMission,
  updateMission,
} from '@/api/missions'
import type {
  CreateMissionRequest,
  GenerateAiMissionsRequest,
  ID,
  SubmitMissionRequest,
  UpdateMissionRequest,
} from '@/types/api'

/**
 * 챌린지의 미션 목록 (화면 23).
 * 비활성 미션도 함께 온다 — 화면에서 구분해 표시한다.
 */
export function useMissions(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.missions(String(challengeId)),
    queryFn: () => fetchMissions(challengeId),
    enabled: Number.isFinite(challengeId),
  })
}

/**
 * 활성 미션이 하나라도 있는지 — 그룹 홈의 "오늘의 미션 뽑기" 활성 여부를 가른다.
 *
 * 2026-08-25부터 오늘의 미션 응답이 hasActiveMission을 직접 내려준다.
 * 방장 관리용인 미션 목록을 팀원 화면에서 끌어다 쓰지 않아도 된다.
 *
 * 부수효과: 이 조회는 오늘 배정이 없으면 서버가 배정을 만든다 — 그룹 홈에 들어가는 것만으로
 * 그날 미션이 뽑힌다. 조회 전용 플래그를 두지 않기로 했다(2026-08-25 확정):
 * **제출하지 않은 배정은 어느 조회 API에도 드러나지 않기 때문이다.**
 * 캘린더·팀 피드·스트릭은 모두 MISSION_LOGS 기준이고, /me/mission-logs 는 미제출 건을 담지 않는다.
 * 배정은 챌린지 공용이고 금액도 완료 전까지 감춰져 "카드뽑기" 연출은 그대로다.
 *
 * 쿼리 키를 useTodayMission과 공유해서 뽑기 화면(10)으로 넘어가도 다시 호출하지 않는다.
 */
export function useHasActiveMission(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.todayMission(String(challengeId)),
    queryFn: () => fetchTodayMission(challengeId),
    enabled: Number.isFinite(challengeId),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    select: (today) => today.hasActiveMission,
  })
}

/**
 * 오늘의 미션 (화면 10).
 *
 * 조회 자체가 "카드뽑기"다 — 오늘 배정이 없으면 서버가 이 호출 시점에 만든다.
 * 그래서 화면을 열 때마다 새로 뽑히지 않도록 캐시를 길게 잡고 자동 재조회를 끈다.
 */
export function useTodayMission(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.todayMission(String(challengeId)),
    queryFn: () => fetchTodayMission(challengeId),
    enabled: Number.isFinite(challengeId),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}

/** 미션 직접 생성 — createdByType=OWNER (화면 24) */
export function useCreateMission(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateMissionRequest) =>
      createMission(challengeId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.missions(String(challengeId)),
      })
    },
  })
}

/**
 * AI 미션 제안 받기 (FR-009, 화면 24).
 *
 * 이 호출만으로는 저장되지 않는다. 방장이 고른 제안을 useCreateMission으로
 * 다시 등록하는 2단계 흐름이라, 여기서는 목록 캐시를 건드리지 않는다.
 */
export function useGenerateAiMissions(challengeId: ID) {
  return useMutation({
    mutationFn: (body: GenerateAiMissionsRequest) =>
      generateAiMissions(challengeId, body),
  })
}

/** 미션 수정·비활성화 토글 (화면 25) */
export function useUpdateMission(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({
      missionId,
      body,
    }: {
      missionId: ID
      body: UpdateMissionRequest
    }) => updateMission(missionId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.missions(String(challengeId)),
      })
    },
  })
}

/**
 * 미션 제출 (FR-011, 화면 11).
 * 오늘 이미 제출했으면 409. 성공하면 오늘의 미션 상태와 계좌·기록이 모두 달라진다.
 */
export function useSubmitMission(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: ({
      missionId,
      body,
    }: {
      missionId: ID
      body: SubmitMissionRequest
    }) => submitMission(missionId, body),
    onSuccess: () => {
      const id = String(challengeId)
      void client.invalidateQueries({ queryKey: queryKeys.todayMission(id) })
      void client.invalidateQueries({ queryKey: queryKeys.missionLogs(id) })
      void client.invalidateQueries({ queryKey: queryKeys.myAccount(id) })
      void client.invalidateQueries({ queryKey: queryKeys.myTransactions(id) })
      void client.invalidateQueries({ queryKey: queryKeys.accountSummary(id) })
    },
  })
}
