import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ID } from '@/types/api'

/**
 * 현재 보고 있는 챌린지 ID.
 *
 * 한 사용자가 여러 챌린지에 속할 수 있고(FR-006), 은행 앱의 계좌 목록처럼 전환하며 쓴다.
 * 앱을 다시 켰을 때 마지막으로 보던 챌린지로 돌아오도록 persist를 걸었다.
 * 챌린지 상세 데이터 자체는 서버 상태이므로 Query로 가져온다 — 여기에는 ID만 둔다.
 */
interface ChallengeState {
  selectedChallengeId: ID | null
  selectChallenge: (challengeId: ID | null) => void
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set) => ({
      selectedChallengeId: null,
      selectChallenge: (challengeId) =>
        set({ selectedChallengeId: challengeId }),
    }),
    { name: 'together.selectedChallenge' },
  ),
)
