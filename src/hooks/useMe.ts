import { useMutation, useQuery } from '@tanstack/react-query'

import { fetchMyCalendar, fetchMyMissionLogs, withdrawAccount } from '@/api/me'
import { queryClient, queryKeys } from '@/api/queryClient'
import { useAuthStore } from '@/store/authStore'
import type { ISODate } from '@/types/api'

/**
 * 내 기록 캘린더 (화면 16).
 *
 * 참여 중인 모든 챌린지가 한 응답에 합쳐져 온다 — 예전처럼 챌린지 수만큼
 * 나눠 호출하지 않는다. totalStreak(전체 활동 연속일)도 여기 실려 온다.
 */
export function useMyCalendar(from?: ISODate, to?: ISODate) {
  return useQuery({
    queryKey: queryKeys.myCalendar(from, to),
    queryFn: () => fetchMyCalendar({ from, to }),
  })
}

/** 캘린더에서 고른 날짜의 내 미션 목록 (FR-040, 화면 16) */
export function useMyMissionLogs(date?: ISODate) {
  return useQuery({
    queryKey: queryKeys.myMissionLogs(date),
    queryFn: () => fetchMyMissionLogs(date),
    enabled: date != null,
  })
}

/**
 * 계정 탈퇴 (FR-043, 화면 27).
 *
 * 204를 받으면 발급된 JWT는 만료까지 유효하지만 모든 멤버십이 LEFT라 쓸 데가 없다.
 * 그래서 성공 즉시 토큰을 지우고 캐시를 비운다 — 다음 사용자에게 이전 데이터가 비치면 안 된다.
 */
export function useWithdrawAccount() {
  const signOut = useAuthStore((state) => state.signOut)

  return useMutation({
    mutationFn: withdrawAccount,
    onSuccess: async () => {
      await signOut()
      queryClient.clear()
    },
  })
}
