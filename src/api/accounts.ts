import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  AccountSummaryResponse,
  ID,
  MyAccountResponse,
  TransactionItem,
  TransactionListResponse,
} from '@/types/api'

/**
 * 챌린지 전체 계좌 합산 (화면 03·08).
 * 팀 진행률뿐 아니라 멤버별 잔액(accounts[])도 함께 내려온다.
 */
export async function fetchAccountSummary(challengeId: ID) {
  const { data } = await apiClient.get<AccountSummaryResponse>(
    ENDPOINTS.accounts.summary(challengeId),
  )
  return data
}

/** 내 가상 계좌 잔액 (화면 13) */
export async function fetchMyAccount(challengeId: ID) {
  const { data } = await apiClient.get<MyAccountResponse>(
    ENDPOINTS.accounts.me(challengeId),
  )
  return data
}

/**
 * 내 거래 내역 (화면 13).
 * 재판정으로 생긴 REVERSAL(회수, 음수)·RE_PAYMENT(재지급)도 함께 온다 (FR-012d, FR-018).
 *
 * ⚠️ 팀원 계좌 조회 엔드포인트가 명세에 없다.
 *   v0.4 FR-018은 "팀원 계좌도 읽기 전용 조회 가능"이라고 하는데 /accounts/me 계열만 있어
 *   화면 13b의 거래 내역을 채울 수단이 없다. 잔액까지는 fetchAccountSummary의 accounts[]로
 *   대체 가능하지만 내역은 불가 — 백엔드 확인 필요.
 */
export async function fetchMyTransactions(
  challengeId: ID,
): Promise<TransactionItem[]> {
  const { data } = await apiClient.get<TransactionListResponse>(
    ENDPOINTS.accounts.myTransactions(challengeId),
  )
  return data.transactions
}
