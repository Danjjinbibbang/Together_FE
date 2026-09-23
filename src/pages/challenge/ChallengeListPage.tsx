import { useNavigate } from 'react-router-dom'

import { ChallengeCard } from '@/components/domain/ChallengeCard'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar, TopBarAction } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { useChallenges } from '@/hooks/useChallenges'
import { ROUTES } from '@/routes/paths'

/**
 * 04. 챌린지 목록.
 * ver3부터 홈(03)이 이 역할을 겸하지만, 별도 진입 경로로 남겨둔 화면이다.
 */
export function ChallengeListPage() {
  const navigate = useNavigate()
  const challengesQuery = useChallenges()

  return (
    <MobileFrame>
      <TopBar
        title="내 챌린지"
        showBack
        right={
          <TopBarAction
            label="챌린지 만들기"
            icon="+"
            variant="primary"
            onClick={() => navigate(ROUTES.challengeCreate)}
          />
        }
      />

      <PageContent className="pb-6">
        <AsyncBoundary
          query={challengesQuery}
          empty={
            <EmptyState
              action={
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => navigate(ROUTES.challengeJoin)}
                >
                  초대코드로 참여하기
                </Button>
              }
            >
              아직 참여 중인 챌린지가 없어요.
            </EmptyState>
          }
        >
          {(challenges) => (
            <>
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.challengeId}
                  challenge={challenge}
                  onClick={() =>
                    navigate(ROUTES.challenge(String(challenge.challengeId)))
                  }
                />
              ))}

              <EmptyState
                action={
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => navigate(ROUTES.challengeJoin)}
                  >
                    초대코드로 참여하기
                  </Button>
                }
              >
                새 친구 그룹에 초대받으셨나요?
              </EmptyState>
            </>
          )}
        </AsyncBoundary>
      </PageContent>
    </MobileFrame>
  )
}
