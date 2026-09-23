import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx는 재시도해봐야 같은 결과다. 5xx/네트워크 오류만 두 번까지 재시도.
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          if (status && status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

/**
 * 쿼리 키를 문자열로 흩뿌리면 무효화할 때 오타로 조용히 실패한다.
 * 서버 상태 키는 전부 여기서 만들어 쓴다.
 */
export const queryKeys = {
  /** 챌린지 */
  challenges: () => ['challenges'] as const,
  challenge: (challengeId: string) => ['challenges', challengeId] as const,
  inviteCode: (challengeId: string) =>
    ['challenges', challengeId, 'invite-code'] as const,

  /** 멤버 */
  members: (challengeId: string) =>
    ['challenges', challengeId, 'members'] as const,
  myMember: (challengeId: string) =>
    ['challenges', challengeId, 'members', 'me'] as const,

  /** 계좌 */
  accountSummary: (challengeId: string) =>
    ['challenges', challengeId, 'accounts'] as const,
  myAccount: (challengeId: string) =>
    ['challenges', challengeId, 'accounts', 'me'] as const,
  myTransactions: (challengeId: string) =>
    ['challenges', challengeId, 'accounts', 'me', 'transactions'] as const,

  /** 미션 */
  missions: (challengeId: string) =>
    ['challenges', challengeId, 'missions'] as const,
  todayMission: (challengeId: string) =>
    ['challenges', challengeId, 'missions', 'today'] as const,
  missionLogs: (challengeId: string) =>
    ['challenges', challengeId, 'mission-logs'] as const,
  missionLog: (missionLogId: string) => ['mission-logs', missionLogId] as const,

  /** 댓글·리액션 — 대상은 MissionLog다 (FR-022 정정) */
  comments: (missionLogId: string) =>
    ['mission-logs', missionLogId, 'comments'] as const,
  reactions: (missionLogId: string) =>
    ['mission-logs', missionLogId, 'reactions'] as const,

  /** 팀 응원 메시지 (FR-044, 화면 08) */
  teamMessages: (challengeId: string) =>
    ['challenges', challengeId, 'messages'] as const,

  /** 전 챌린지 통합 본인 데이터 (화면 16) */
  myCalendar: (from?: string, to?: string) =>
    ['me', 'calendar', { from, to }] as const,
  myMissionLogs: (date?: string) => ['me', 'mission-logs', { date }] as const,

  /** 알림 */
  notifications: () => ['notifications'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
} as const
