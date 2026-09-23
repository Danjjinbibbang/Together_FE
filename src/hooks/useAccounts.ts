import { useQuery } from '@tanstack/react-query'

import {
  fetchAccountSummary,
  fetchMyAccount,
  fetchMyTransactions,
} from '@/api/accounts'
import { queryKeys } from '@/api/queryClient'
import type { ID } from '@/types/api'

/**
 * 챌린지 전체 계좌 합산 (화면 03·08).
 *
 * 멤버별 잔액(accounts[])도 함께 온다. 팀원 계좌 화면(13b)의 잔액은
 * 전용 API가 없으므로 이 응답에서 꺼내 쓴다.
 *
 * 팀원이 미션을 완료하면 값이 바뀌는데 그 사실을 브라우저가 알 방법이 없어,
 * 알림과 같은 폴링 주기로 주기적으로 다시 물어본다 (NFR-003).
 */
export function useAccountSummary(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.accountSummary(String(challengeId)),
    queryFn: () => fetchAccountSummary(challengeId),
    enabled: Number.isFinite(challengeId),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

/** 내 가상 계좌 잔액 (화면 13) */
export function useMyAccount(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.myAccount(String(challengeId)),
    queryFn: () => fetchMyAccount(challengeId),
    enabled: Number.isFinite(challengeId),
  })
}

/**
 * 내 거래 내역 (화면 13).
 * 팀원 내역을 받는 API는 없다 — 백엔드 결정(2026-08-20)으로 본인만 조회한다.
 */
export function useMyTransactions(challengeId: ID) {
  return useQuery({
    queryKey: queryKeys.myTransactions(String(challengeId)),
    queryFn: () => fetchMyTransactions(challengeId),
    enabled: Number.isFinite(challengeId),
  })
}
