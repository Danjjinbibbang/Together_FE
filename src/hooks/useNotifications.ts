import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
} from '@/api/notifications'
import { queryKeys } from '@/api/queryClient'
import type { ID } from '@/types/api'

/**
 * 알림 폴링 주기.
 *
 * MVP는 WebSocket 없이 폴링으로 간다 (NFR-003). 목록은 알림함을 보고 있을 때만
 * 필요하니 30초, 뱃지는 전 화면 상단바에 늘 떠 있고 응답도 숫자 하나뿐이라 조금 더 자주 본다.
 * 백그라운드에서는 둘 다 멈춰 배터리를 아낀다.
 */
const LIST_POLL_MS = 30_000
const BADGE_POLL_MS = 20_000

/** 내 알림 목록 (화면 15) */
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: fetchNotifications,
    refetchInterval: LIST_POLL_MS,
    refetchIntervalInBackground: false,
  })
}

/** 상단바 뱃지용 미확인 개수 (전역) */
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: BADGE_POLL_MS,
    refetchIntervalInBackground: false,
  })
}

/** 알림 읽음 처리 (FR-021) */
export function useMarkNotificationAsRead() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: ID) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.notifications() })
      // 상단바 뱃지 숫자도 같이 줄어야 한다
      void client.invalidateQueries({ queryKey: queryKeys.unreadCount() })
    },
  })
}
