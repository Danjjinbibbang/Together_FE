import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ISODate,
  MyCalendarParams,
  MyCalendarResponse,
  MyMissionLogItem,
  MyMissionLogsResponse,
} from '@/types/api'

/**
 * 전 챌린지를 통합한 본인 데이터 (2026-08-25 신설).
 *
 * 이전에는 챌린지마다 mission-logs를 따로 불러 프론트에서 합쳤다(참여 수만큼 N번).
 * 전체 활동 연속일은 애초에 한 챌린지 안에서 셀 수 없어서, 백엔드가 통합 엔드포인트를 냈다.
 */

/**
 * 내 기록 캘린더 (FR-025②·FR-027·FR-041, 화면 16).
 * 범위를 생략하면 이번 달 1일~말일. 366일을 넘기면 400이다.
 */
export async function fetchMyCalendar(params?: MyCalendarParams) {
  const { data } = await apiClient.get<MyCalendarResponse>(
    ENDPOINTS.me.calendar,
    { params },
  )
  return data
}

/**
 * 특정 날짜의 내 미션 목록 (FR-040, 화면 16).
 * date를 생략하면 오늘. 본인 기록이라 비공개 건도 빠지지 않는다.
 */
export async function fetchMyMissionLogs(
  date?: ISODate,
): Promise<MyMissionLogItem[]> {
  const { data } = await apiClient.get<MyMissionLogsResponse>(
    ENDPOINTS.me.missionLogs,
    { params: date ? { date } : undefined },
  )
  return data.missionLogs
}

/**
 * 계정 탈퇴 (FR-043, 화면 27). 204라 응답 바디가 없다.
 *
 * 챌린지 탈퇴와는 다르다 — 참여 중인 모든 챌린지에서 나가고 계정을 닫는다.
 * 방장으로 남아 있는 챌린지가 있으면 409다(혼자만 남은 챌린지는 예외).
 * 성공하면 토큰을 지우고 로그인 화면으로 보내면 된다.
 */
export async function withdrawAccount() {
  await apiClient.delete(ENDPOINTS.users.me)
}
