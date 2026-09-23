import { useMyAccount } from '@/hooks/useAccounts'
import { useChallenge } from '@/hooks/useChallenges'
import { useMembers } from '@/hooks/useMembers'
import { toPercent } from '@/lib/format'
import type { ID } from '@/types/api'

/**
 * 목표 달성 판정 — 개인과 팀을 따로 본다 (FR-045, 2026-08-25 기획 확정).
 *
 * `goalAmount`는 팀 합산이 아니라 **1인당 목표**다. 목표 50만원 · 팀원 4명이면
 * 각자 50만원씩, 팀 전체로는 200만원을 모아야 완주다.
 *
 *   - 개인 달성: 내 잔액 ≥ goalAmount → 내 미션은 끝, 이제 팀원을 응원한다
 *   - 팀 달성  : 활성 멤버 전원이 각자 목표를 채움
 *
 * 팀 달성을 합계(totalBalance ≥ goalAmount × 인원)로 보지 않고 멤버별로 확인하는 이유:
 * 합계는 누군가 초과로 모았을 때 아직 못 채운 사람을 가릴 수 있다. 멤버 목록에
 * 각자 balance가 있으므로 정확히 셀 수 있다.
 *
 * ⚠️ 서버가 달성 여부를 직접 내려주지 않아 프론트가 계산한다. 응답에
 *   isGoalAchieved / isTeamGoalAchieved 를 넣어달라고 요청해둔 상태다.
 */
export function useGoalProgress(challengeId: ID) {
  const { data: challenge } = useChallenge(challengeId)
  const { data: myAccount } = useMyAccount(challengeId)
  // 훅이 탈퇴자(LEFT)를 걸러주므로 활성 멤버만 남는다
  const { data: members } = useMembers(challengeId)

  const isLoaded = challenge != null && myAccount != null && members != null

  if (!isLoaded) {
    return {
      isLoaded: false as const,
      isMineAchieved: undefined,
      isTeamAchieved: undefined,
      myBalance: undefined,
      teamGoalAmount: undefined,
      teamProgressRate: undefined,
      achievedCount: undefined,
      memberCount: undefined,
    }
  }

  const goal = challenge.goalAmount
  const achievedCount = members.filter(
    (member) => member.balance >= goal,
  ).length

  /*
    팀 목표 = 1인당 목표 × 활성 멤버수.

    서버의 progressRate는 아직 totalBalance ÷ goalAmount 라서, 4명이 각자 1/4씩만 모아도
    100%로 나온다. 수식이 정정될 때까지 화면은 이 값을 쓴다 — 자세한 사정은
    claude 컨텍스트 §12 "goalAmount는 1인당 목표" 참고.
  */
  const teamGoalAmount = goal * members.length

  return {
    isLoaded: true as const,
    isMineAchieved: myAccount.balance >= goal,
    isTeamAchieved: members.length > 0 && achievedCount === members.length,
    myBalance: myAccount.balance,
    teamGoalAmount,
    teamProgressRate: toPercent(challenge.totalBalance, teamGoalAmount),
    achievedCount,
    memberCount: members.length,
  }
}
