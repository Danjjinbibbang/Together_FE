import { useNavigate, useParams } from 'react-router-dom'

import { MissionDrawCard } from '@/components/domain/MissionCard'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Button } from '@/components/ui/Button'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { useGoalProgress } from '@/hooks/useGoalProgress'
import { useTodayMission } from '@/hooks/useMissions'
import { ROUTES } from '@/routes/paths'

/**
 * 10. 오늘의 미션 카드뽑기 (FR-010).
 *
 * 조회 자체가 뽑기다 — 오늘 배정이 없으면 서버가 이 호출 시점에 만든다.
 * 챌린지당 하루 1개 공통이라 멤버별로 다른 미션이 나오지 않고, 보상 금액도 팀 전체가 같다.
 */
export function MissionDrawPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const todayQuery = useTodayMission(challengeId)
  const today = todayQuery.data
  const alreadySubmitted =
    today?.hasActiveMission === true && today.mySubmissionStatus != null

  // 목표를 채운 멤버는 더 이상 수행하지 않는다 (FR-045).
  // 그룹 홈에서 이미 막지만, 주소를 직접 치거나 뒤로가기로 들어오는 길이 있어 여기서도 본다.
  const { isMineAchieved } = useGoalProgress(challengeId)

  return (
    <MobileFrame background="brand">
      <TopBar title="오늘의 미션" showBack tone="onBrand" />

      <PageContent className="px-6 pt-6 text-center">
        <p className="mb-7 text-[13px] leading-relaxed text-white/85">
          오늘 하루, 챌린지 전체가 함께 도전할
          <br />
          미션 카드를 뽑아보세요 🎴
        </p>

        <AsyncBoundary query={todayQuery}>
          {(today) =>
            isMineAchieved ? (
              <>
                <NoticeBox className="mb-4 text-left">
                  🏆 목표를 다 모아서 미션은 여기까지예요. 아직 모으는 중인
                  팀원의 기록에 리액션과 댓글로 응원해주세요.
                </NoticeBox>
                <Button
                  variant="accent"
                  onClick={() => navigate(`/challenges/${challengeId}/feed`)}
                >
                  팀 활동 피드 보기
                </Button>
              </>
            ) : // 방장이 미션을 전부 비활성화하면 뽑을 게 없다. 오류가 아니라 정상 상태다.
            !today.hasActiveMission ? (
              <>
                <NoticeBox className="mb-4 text-left">
                  🗂 아직 준비된 미션이 없어요. 방장이 미션을 등록하면 뽑을 수
                  있어요.
                </NoticeBox>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate(ROUTES.challenge(String(challengeId)))
                  }
                >
                  그룹 홈으로
                </Button>
              </>
            ) : (
              <>
                <MissionDrawCard
                  emoji={today.submitType === 'PHOTO' ? '📷' : '✍️'}
                  title={today.title}
                  rewardMin={today.rewardMin}
                  rewardMax={today.rewardMax}
                />

                {alreadySubmitted ? (
                  <>
                    <NoticeBox className="mb-4 text-left">
                      💡 오늘은 이미 미션을 제출했어요. 하루에 한 번만 수행할 수
                      있어요.
                    </NoticeBox>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigate(ROUTES.challenge(String(challengeId)))
                      }
                    >
                      그룹 홈으로
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="accent"
                    onClick={() =>
                      navigate(ROUTES.missionWrite(String(challengeId)))
                    }
                  >
                    미션 시작하기
                  </Button>
                )}
              </>
            )
          }
        </AsyncBoundary>
      </PageContent>
    </MobileFrame>
  )
}
