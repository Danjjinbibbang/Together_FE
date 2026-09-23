import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import { ModeCard } from '@/components/domain/MissionCard'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { useChallenge, useUpdateMissionMode } from '@/hooks/useChallenges'
import type { MissionMode } from '@/types/api'

/**
 * 09. 미션 운영 방식 설정 (FR-007, FR-008 — MVP는 방장 단독 결정).
 *
 * `?setup=1`이면 챌린지 생성 플로우의 한 단계로 동작한다.
 * 이땐 방식을 고른 뒤 곧바로 미션 등록(화면 24)으로 이어지며, 건너뛸 수 없다 —
 * 미션 0개인 챌린지로 친구를 초대하는 상황을 막기 위해서다.
 *
 * 저장 시점이 두 가지다:
 *   - 설정 화면으로 들어왔을 때 → 카드를 고르는 즉시 저장 (미션 관리 토글과 같은 방식)
 *   - 생성 플로우 중일 때      → 하단 버튼에서 저장하고 다음 단계로
 */
export function MissionModePage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)
  const [searchParams] = useSearchParams()
  const isSetup = searchParams.get('setup') === '1'

  const challengeQuery = useChallenge(challengeId)
  const updateMissionMode = useUpdateMissionMode(challengeId)

  // 생성 직후에는 missionMode가 null이라 기본값으로 FIXED를 보여준다
  const [mode, setMode] = useState<MissionMode>('FIXED')

  // 서버에 저장된 값이 도착하면 그걸로 맞춘다
  const savedMode = challengeQuery.data?.missionMode
  useEffect(() => {
    if (savedMode) setMode(savedMode)
  }, [savedMode])

  const selectMode = (next: MissionMode) => {
    setMode(next)
    // 생성 플로우에서는 하단 버튼이 저장을 맡으므로 여기서 두 번 보내지 않는다
    if (!isSetup) updateMissionMode.mutate({ missionMode: next })
  }

  const goToMissions = () =>
    navigate(`/challenges/${challengeId}/missions${isSetup ? '?setup=1' : ''}`)
  const goToCreate = () =>
    navigate(
      `/challenges/${challengeId}/missions/new${isSetup ? '?setup=1' : ''}`,
    )

  /** 고른 방식을 저장한 뒤에만 다음 단계로 넘어간다 */
  const saveAndContinue = async () => {
    try {
      await updateMissionMode.mutateAsync({ missionMode: mode })
      goToCreate()
    } catch {
      // 실패 문구는 아래 Toast가 mutation 상태를 보고 그린다
    }
  }

  return (
    <MobileFrame>
      <TopBar
        title={isSetup ? '미션 정하기 (2/3)' : '미션 운영 방식 설정'}
        showBack
      />

      <PageContent className="pb-8">
        {isSetup && (
          <NoticeBox tone="info" className="mb-5">
            💡 어떤 방식으로 미션을 낼지 먼저 정해요. 다음 단계에서 미션을 최소
            1개 등록해야 친구를 초대할 수 있어요.
          </NoticeBox>
        )}

        <AsyncBoundary query={challengeQuery}>
          {() => (
            <>
              <ModeCard
                emoji="📋"
                name="고정 미션 풀"
                description="등록해둔 여러 미션 중 매일 하나가 챌린지 전체에 공통으로 랜덤 배정돼요."
                selected={mode === 'FIXED'}
                onSelect={() => selectMode('FIXED')}
                action={
                  isSetup
                    ? undefined
                    : { label: '🗂 미션 관리로 이동', onClick: goToMissions }
                }
              />

              <ModeCard
                emoji="✨"
                name="AI 추천 미션"
                description="챌린지 테마를 정해두면 AI가 그날의 미션을 자동으로 만들어 배정해요."
                selected={mode === 'AI'}
                onSelect={() => selectMode('AI')}
                action={
                  isSetup
                    ? undefined
                    : { label: '✨ AI로 미션 만들기', onClick: goToCreate }
                }
              />
            </>
          )}
        </AsyncBoundary>

        {updateMissionMode.isError && (
          <Toast tone="error" className="mt-4">
            ⚠{' '}
            {getErrorMessage(
              updateMissionMode.error,
              '운영 방식을 저장하지 못했어요.',
            )}
          </Toast>
        )}

        <NoticeBox tone="info" className="mt-5">
          💡 운영 방식은 주 1회(매주 일요일) 다음 주 것으로 재설정할 수 있어요.
        </NoticeBox>
      </PageContent>

      {isSetup && (
        <PageFooter>
          <Button
            disabled={updateMissionMode.isPending}
            onClick={() => void saveAndContinue()}
          >
            {updateMissionMode.isPending ? '저장 중…' : '다음 · 미션 등록하기'}
          </Button>
        </PageFooter>
      )}
    </MobileFrame>
  )
}
