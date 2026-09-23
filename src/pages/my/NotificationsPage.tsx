import { useNavigate } from 'react-router-dom'

import { NotificationRow } from '@/components/domain/NotificationRow'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { EmptyState } from '@/components/ui/Feedback'
import {
  useMarkNotificationAsRead,
  useNotifications,
} from '@/hooks/useNotifications'
import { ROUTES } from '@/routes/paths'
import type { NotificationItem } from '@/types/api'

/**
 * 15. 알림함 (FR-020, FR-021).
 * MVP는 폴링으로 새 알림을 가져온다 (NFR-003) — 주기는 훅에 있다.
 */
export function NotificationsPage() {
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()
  const markAsRead = useMarkNotificationAsRead()

  /**
   * 알림을 열면 읽음 처리하고 대상 화면으로 이동한다.
   *
   * targetType으로 갈린다:
   *   - MISSION_LOG  → 미션 상세(화면 14)
   *   - CHALLENGE    → 팀 목표 달성 축하(화면 17). 팀 달성은 마지막 팀원의 입금으로
   *     발생해서 이미 끝낸 사람은 결과 화면(12)을 거치지 않는다 — 알림이 유일한 통로다.
   *   - TEAM_MESSAGE → 응원 메시지가 걸린 그룹 홈(화면 08)
   */
  const openNotification = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.notificationId)
    }
    if (notification.targetId == null) return

    const targetId = String(notification.targetId)
    switch (notification.targetType) {
      case 'CHALLENGE':
        navigate(`${ROUTES.celebration(targetId)}?scope=team`)
        return
      case 'TEAM_MESSAGE':
        /*
          ⚠️ targetId가 messageId라서 어느 챌린지인지 알 수 없다.
            알림 응답에 challengeId가 없어 그룹 홈으로 곧장 보낼 수단이 없다 —
            우선 알림함에 머무르게 두고 백엔드에 challengeId 추가를 요청해뒀다.
        */
        return
      default:
        navigate(ROUTES.missionLog(targetId))
    }
  }

  return (
    <MobileFrame>
      <TopBar title="알림함" showBack />

      <PageContent className="pb-8">
        <AsyncBoundary
          query={notificationsQuery}
          empty={
            <EmptyState className="mt-6">아직 도착한 알림이 없어요</EmptyState>
          }
        >
          {(notifications) =>
            notifications.map((notification) => (
              <NotificationRow
                key={notification.notificationId}
                notification={notification}
                onClick={() => openNotification(notification)}
              />
            ))
          }
        </AsyncBoundary>
      </PageContent>
    </MobileFrame>
  )
}
