import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ID,
  NotificationItem,
  NotificationListResponse,
  ReadNotificationResponse,
  UnreadCountResponse,
} from '@/types/api'

/**
 * 알림은 MVP에서 폴링으로 가져온다 (NFR-003).
 * 조회 주기는 훅에서 refetchInterval로 준다 — 여기서는 요청만 담당한다.
 */

/**
 * 내 알림 목록 (화면 15).
 * targetType에 따라 이동할 화면이 갈린다 — MISSION_LOG면 targetId를 missionLogId로 써서 화면 14로.
 */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationListResponse>(
    ENDPOINTS.notifications.root,
  )
  return data.notifications
}

/** 상단바 뱃지용 미확인 개수 — 전역이라 목록보다 짧은 주기로 폴링해도 부담이 적다 */
export async function fetchUnreadCount() {
  const { data } = await apiClient.get<UnreadCountResponse>(
    ENDPOINTS.notifications.unreadCount,
  )
  return data.unreadCount
}

/** 알림 읽음 처리 (FR-021) */
export async function markNotificationAsRead(notificationId: ID) {
  const { data } = await apiClient.patch<ReadNotificationResponse>(
    ENDPOINTS.notifications.read(notificationId),
  )
  return data
}
