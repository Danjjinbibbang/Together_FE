import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteTeamMessage,
  fetchTeamMessages,
  sendTeamMessage,
} from '@/api/messages'
import { queryKeys } from '@/api/queryClient'
import type { ID, SendTeamMessageRequest } from '@/types/api'

/**
 * 팀 응원 메시지 목록 (FR-044, 화면 08).
 *
 * 커서 페이지네이션이지만 그룹 홈은 최근 몇 건만 보여주면 되므로 첫 페이지만 받는다.
 * 전체를 훑는 화면이 생기면 useInfiniteQuery로 바꾸면 된다.
 */
export function useTeamMessages(challengeId: ID, size = 5) {
  return useQuery({
    queryKey: queryKeys.teamMessages(String(challengeId)),
    queryFn: () => fetchTeamMessages(challengeId, { size }),
    enabled: Number.isFinite(challengeId),
    select: (data) => data.messages,
  })
}

/**
 * 응원 보내기.
 * 하루 5건 제한이라 429가 자주 나올 수 있다 — 호출부가 에러 문구를 꼭 보여줘야 한다.
 */
export function useSendTeamMessage(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: SendTeamMessageRequest) =>
      sendTeamMessage(challengeId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.teamMessages(String(challengeId)),
      })
    },
  })
}

/**
 * 응원 삭제 — 작성자 본인만.
 * 팀원 알림함에서도 사라지므로 미확인 배지 숫자까지 다시 읽어야 한다.
 */
export function useDeleteTeamMessage(challengeId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (messageId: ID) => deleteTeamMessage(challengeId, messageId),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.teamMessages(String(challengeId)),
      })
      void client.invalidateQueries({ queryKey: queryKeys.notifications() })
      void client.invalidateQueries({ queryKey: queryKeys.unreadCount() })
    },
  })
}
