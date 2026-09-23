import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/api/queryClient'
import {
  autoApproveMissionLog,
  disputeMissionLog,
  fetchMissionLog,
  fetchMissionLogs,
  requestRecheck,
  resubmitMissionLog,
  reviewMissionLog,
} from '@/api/missions'
import type {
  DisputeRequest,
  ID,
  MissionLogListParams,
  ResubmitRequest,
  ReviewRequest,
} from '@/types/api'

/**
 * 미션 로그 목록.
 * date를 주면 캘린더(화면 16), 없이 부르면 팀 활동 피드(화면 26)가 된다.
 */
export function useMissionLogs(challengeId: ID, params?: MissionLogListParams) {
  return useQuery({
    // 필터가 다르면 다른 목록이므로 키에 포함시킨다
    queryKey: [...queryKeys.missionLogs(String(challengeId)), params ?? {}],
    queryFn: () => fetchMissionLogs(challengeId, params),
    enabled: Number.isFinite(challengeId),
  })
}

/** 미션 로그 상세 (화면 12·14) */
export function useMissionLog(missionLogId: ID) {
  return useQuery({
    queryKey: queryKeys.missionLog(String(missionLogId)),
    queryFn: () => fetchMissionLog(missionLogId),
    enabled: Number.isFinite(missionLogId),
  })
}

/**
 * 이의제기 흐름 3종 (FR-012a~c).
 * 모두 상태만 바꾸므로 성공 시 해당 로그를 다시 읽어오면 된다.
 */
export function useDisputeActions(missionLogId: ID) {
  const client = useQueryClient()

  const invalidate = () => {
    void client.invalidateQueries({
      queryKey: queryKeys.missionLog(String(missionLogId)),
    })
  }

  /** 이의제기 시작 — status가 AI_REJECTED일 때만 호출 가능 */
  const dispute = useMutation({
    mutationFn: (body: DisputeRequest) => disputeMissionLog(missionLogId, body),
    onSuccess: invalidate,
  })

  /** 그대로 재검토 요청 */
  const recheck = useMutation({
    mutationFn: () => requestRecheck(missionLogId),
    onSuccess: invalidate,
  })

  /** 수정 후 재제출 */
  const resubmit = useMutation({
    mutationFn: (body: ResubmitRequest) =>
      resubmitMissionLog(missionLogId, body),
    onSuccess: invalidate,
  })

  return { dispute, recheck, resubmit }
}

/**
 * 방장/2차 판독 재판정 (FR-012c).
 *
 * 승인·반려에 따라 보상 지급/회수 거래가 서버에서 함께 생기므로,
 * 잔액과 거래 내역까지 무효화해야 화면이 어긋나지 않는다 (FR-012d).
 */
export function useReviewMissionLog(missionLogId: ID, challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: ReviewRequest) => reviewMissionLog(missionLogId, body),
    onSuccess: () => invalidateAfterReview(client, missionLogId, challengeId),
  })
}

/**
 * 자동 승인 요청 (FR-012c, 2026-08-25 신설).
 *
 * 방장이 72시간 넘게 응답하지 않을 때 작성자가 직접 확정시킨다.
 * 승인되면 보상이 지급되므로 재판정과 같은 범위를 무효화한다.
 */
export function useAutoApproveMissionLog(missionLogId: ID, challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: () => autoApproveMissionLog(missionLogId),
    onSuccess: () => invalidateAfterReview(client, missionLogId, challengeId),
  })
}

/**
 * 판정이 끝나면 보상 지급·회수가 함께 일어나므로,
 * 잔액과 거래 내역까지 무효화해야 화면이 어긋나지 않는다 (FR-012d).
 */
function invalidateAfterReview(
  client: ReturnType<typeof useQueryClient>,
  missionLogId: ID,
  challengeId: ID,
) {
  const id = String(challengeId)
  void client.invalidateQueries({
    queryKey: queryKeys.missionLog(String(missionLogId)),
  })
  void client.invalidateQueries({ queryKey: queryKeys.missionLogs(id) })
  void client.invalidateQueries({ queryKey: queryKeys.myAccount(id) })
  void client.invalidateQueries({ queryKey: queryKeys.myTransactions(id) })
  void client.invalidateQueries({ queryKey: queryKeys.accountSummary(id) })
}
