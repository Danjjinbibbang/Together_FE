import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  CreateMissionRequest,
  CreateMissionResponse,
  DisputeRequest,
  GenerateAiMissionsRequest,
  GenerateAiMissionsResponse,
  ID,
  MissionListItem,
  MissionListResponse,
  MissionLogDetailResponse,
  MissionLogListItem,
  MissionLogListParams,
  MissionLogListResponse,
  MissionLogStatusResponse,
  ResubmitRequest,
  ReviewRequest,
  ReviewResponse,
  SubmitMissionRequest,
  SubmitMissionResponse,
  TodayMissionResponse,
  UpdateMissionRequest,
  UpdateMissionResponse,
} from '@/types/api'

/* ── 미션 마스터 (방장 관리) ──────────────────────────────────── */

/** 챌린지의 미션 목록 — 비활성 미션도 포함해서 온다 (화면 23) */
export async function fetchMissions(
  challengeId: ID,
): Promise<MissionListItem[]> {
  const { data } = await apiClient.get<MissionListResponse>(
    ENDPOINTS.missions.list(challengeId),
  )
  return data.missions
}

/** 미션 직접 생성 — createdByType=OWNER (화면 24) */
export async function createMission(
  challengeId: ID,
  body: CreateMissionRequest,
) {
  const { data } = await apiClient.post<CreateMissionResponse>(
    ENDPOINTS.missions.list(challengeId),
    body,
  )
  return data
}

/**
 * AI 미션 제안 받기 (FR-009, 화면 24).
 *
 * 주의: 이 호출만으로는 미션이 저장되지 않는다.
 * 방장이 제안 중 고른 것을 createMission으로 다시 등록하는 2단계 흐름이다.
 */
export async function generateAiMissions(
  challengeId: ID,
  body: GenerateAiMissionsRequest,
) {
  const { data } = await apiClient.post<GenerateAiMissionsResponse>(
    ENDPOINTS.missions.aiGenerate(challengeId),
    body,
  )
  return data.suggestions
}

/**
 * 미션 수정·비활성화 토글 (화면 25).
 * isActive=false로 바꿔도 기존 수행 기록은 유지된다. 삭제 API는 제공되지 않는다.
 */
export async function updateMission(missionId: ID, body: UpdateMissionRequest) {
  const { data } = await apiClient.patch<UpdateMissionResponse>(
    ENDPOINTS.missions.detail(missionId),
    body,
  )
  return data
}

/* ── 오늘의 미션 · 제출 ───────────────────────────────────────── */

/**
 * 오늘의 미션 조회 (FR-010, 화면 10).
 *
 * 오늘 배정이 없으면 서버가 이 호출 시점에 랜덤 배정을 만든다 — 즉 조회가 곧 "카드뽑기"다.
 * 챌린지당 하루 1개 공통이라 멤버별로 다른 미션이 나오지 않는다.
 */
export async function fetchTodayMission(challengeId: ID) {
  const { data } = await apiClient.get<TodayMissionResponse>(
    ENDPOINTS.missions.today(challengeId),
  )
  return data
}

/**
 * 미션 수행 제출 (FR-011, 화면 11).
 * missionId는 fetchTodayMission이 준 값을 쓴다. 오늘 이미 제출했으면 409.
 */
export async function submitMission(missionId: ID, body: SubmitMissionRequest) {
  const { data } = await apiClient.post<SubmitMissionResponse>(
    ENDPOINTS.missions.submit(missionId),
    body,
  )
  return data
}

/* ── 미션 로그 ────────────────────────────────────────────────── */

/**
 * 미션 로그 목록.
 * date로 좁히면 캘린더(화면 16), 파라미터 없이 부르면 팀 활동 피드(화면 26)가 된다.
 */
export async function fetchMissionLogs(
  challengeId: ID,
  params?: MissionLogListParams,
): Promise<MissionLogListItem[]> {
  const { data } = await apiClient.get<MissionLogListResponse>(
    ENDPOINTS.missionLogs.list(challengeId),
    { params },
  )
  return data.missionLogs
}

/** 미션 로그 상세 (화면 12·14) */
export async function fetchMissionLog(missionLogId: ID) {
  const { data } = await apiClient.get<MissionLogDetailResponse>(
    ENDPOINTS.missionLogs.detail(missionLogId),
  )
  return data
}

/* ── 오탐 이의제기 흐름 (FR-012a~e) ───────────────────────────── */

/** 이의제기 시작 — status가 AI_REJECTED일 때만 호출 가능 (화면 12) */
export async function disputeMissionLog(
  missionLogId: ID,
  body: DisputeRequest,
) {
  const { data } = await apiClient.post<MissionLogStatusResponse>(
    ENDPOINTS.missionLogs.dispute(missionLogId),
    body,
  )
  return data
}

/** 그대로 재검토 요청 — 제출 내용은 두고 상태만 전환한다 */
export async function requestRecheck(missionLogId: ID) {
  const { data } = await apiClient.patch<MissionLogStatusResponse>(
    ENDPOINTS.missionLogs.disputeRecheck(missionLogId),
  )
  return data
}

/** 수정 후 재제출 — 원래 제출형식에 맞는 필드만 보낸다 */
export async function resubmitMissionLog(
  missionLogId: ID,
  body: ResubmitRequest,
) {
  const { data } = await apiClient.patch<MissionLogStatusResponse>(
    ENDPOINTS.missionLogs.disputeResubmit(missionLogId),
    body,
  )
  return data
}

/**
 * 방장/2차 판독 재판정 (FR-012c).
 * 보상 지급·회수 거래는 이 안에서 서버가 자동 생성하므로 별도 호출이 필요 없다 (FR-012d).
 */
export async function reviewMissionLog(missionLogId: ID, body: ReviewRequest) {
  const { data } = await apiClient.post<ReviewResponse>(
    ENDPOINTS.missionLogs.review(missionLogId),
    body,
  )
  return data
}

/**
 * 자동 승인 요청 (2026-08-25 신설, FR-012c).
 *
 * 방장이 판정을 미루면 기록이 대기 상태로 묶여 작성자가 보상을 못 받는다.
 * 작성자 본인이 이 요청을 보내면, 마지막 요청으로부터 72시간이 지났거나
 * 활성 방장이 없는 경우 승인으로 확정되고 보상이 지급된다(reviewedBy=AUTO).
 *
 * 기한 전이면 서버가 거절한다 — 프론트는 마지막 요청 시각을 알 수 없어
 * 미리 막지 못하고 에러 문구로 안내한다.
 */
export async function autoApproveMissionLog(missionLogId: ID) {
  const { data } = await apiClient.post<ReviewResponse>(
    ENDPOINTS.missionLogs.autoApprove(missionLogId),
  )
  return data
}
