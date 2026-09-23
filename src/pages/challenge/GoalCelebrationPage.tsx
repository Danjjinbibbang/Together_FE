import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Button } from '@/components/ui/Button'
import { useChallenge } from '@/hooks/useChallenges'
import { useGoalProgress } from '@/hooks/useGoalProgress'
import { daysSince } from '@/lib/date'
import { formatWon } from '@/lib/format'
import { ROUTES } from '@/routes/paths'

const CONFETTI = [
  { emoji: '🎉', className: 'top-17 left-8' },
  { emoji: '✨', className: 'top-25 right-9' },
  { emoji: '🎊', className: 'top-45 left-15' },
  { emoji: '⭐', className: 'top-40 right-15' },
] as const

/**
 * 17. 목표 달성 축하 (FR-026).
 *
 * 축하가 두 종류다 (2026-08-25 기획 확정) — goalAmount가 1인당 목표라
 * "내가 다 모은 것"과 "팀 전원이 다 모은 것"은 다른 사건이고, 각각 띄운다.
 *
 *   - `?scope=mine` (기본) : 내 목표 달성. 미션 완료 결과(12)에서 자동 진입
 *   - `?scope=team`        : 팀 전원 달성. 챌린지 완주
 *
 * ⚠️ 팀 축하는 내 행동이 아니라 마지막 팀원의 입금으로 발생한다. 이미 달성해서
 *   미션을 안 하는 사람은 화면 12에 오지 않으므로 그 경로로는 못 받는다.
 *   지금은 그룹 홈(08) 배너로 들어오게 해뒀고, 알림 종류 신설을 요청해둔 상태다.
 */
export function GoalCelebrationPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)
  const [searchParams] = useSearchParams()
  const isTeamScope = searchParams.get('scope') === 'team'

  const challengeQuery = useChallenge(challengeId)
  const progress = useGoalProgress(challengeId)

  return (
    <MobileFrame background="celebrate">
      <p className="safe-top absolute inset-x-0 top-7 z-10 text-center text-xs font-bold tracking-wide text-white/75">
        {challengeQuery.data?.title ?? '챌린지'} ·{' '}
        {isTeamScope ? '팀 전체 달성' : '목표 달성'}
      </p>
      <button
        type="button"
        aria-label="닫기"
        onClick={() => navigate(-1)}
        className="absolute top-5.5 right-5 z-10 flex size-7.5 items-center justify-center rounded-full bg-white/20 text-sm text-white"
      >
        ✕
      </button>

      {CONFETTI.map((item) => (
        <span
          key={item.emoji}
          aria-hidden
          className={`absolute text-xl ${item.className}`}
        >
          {item.emoji}
        </span>
      ))}

      <PageContent className="px-7 pt-37 text-center">
        <p className="mb-5 text-7xl" aria-hidden>
          {isTeamScope ? '🎊' : '🏆'}
        </p>
        <h1 className="mb-2.5 text-2xl font-extrabold text-white">
          {isTeamScope ? '팀 전체 달성!' : '목표 달성!'}
        </h1>

        <AsyncBoundary query={challengeQuery}>
          {(challenge) =>
            isTeamScope ? (
              <>
                <p className="mb-7 text-[13px] leading-relaxed text-white/85">
                  "{challenge.title}" 팀원 {progress.memberCount ?? 0}명이
                  <br />
                  각자 {formatWon(challenge.goalAmount)}씩 모두 모았어요
                </p>

                <div className="mb-4 rounded-[20px] bg-white p-5">
                  <p className="text-primary-dark text-2xl font-extrabold">
                    {formatWon(challenge.totalBalance)}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {daysSince(challenge.startDate)}일 동안 함께 모은 금액이에요
                  </p>
                </div>

                <p className="mb-4 text-[12.5px] leading-relaxed text-white/85">
                  챌린지를 완주했어요. 함께한 기록을 돌아볼까요?
                </p>
              </>
            ) : (
              <>
                {/* goalAmount는 1인당 목표라 "내가" 채운 것이다 — 팀 달성과 별개 */}
                <p className="mb-7 text-[13px] leading-relaxed text-white/85">
                  "{challenge.title}"에서
                  <br />
                  목표 금액 {formatWon(challenge.goalAmount)}을 모두 모았어요
                </p>

                <div className="mb-4 rounded-[20px] bg-white p-5">
                  <p className="text-primary-dark text-2xl font-extrabold">
                    {formatWon(progress.myBalance ?? challenge.goalAmount)}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {daysSince(challenge.startDate)}일 동안 모았어요 · 팀원{' '}
                    {progress.memberCount ?? 0}명 중{' '}
                    {progress.achievedCount ?? 0}명 달성
                  </p>
                </div>

                <p className="mb-4 text-[12.5px] leading-relaxed text-white/85">
                  내 미션은 여기까지예요.
                  <br />
                  아직 모으는 중인 팀원을 응원해주세요 🙌
                </p>
              </>
            )
          }
        </AsyncBoundary>

        {/*
          내가 마지막 주자였다면 개인 달성과 팀 완주가 같은 순간에 일어난다.
          축하를 두 번 연달아 밀어붙이지 않고, 이어서 볼 수 있게 길만 내준다.
        */}
        {!isTeamScope && progress.isTeamAchieved && (
          <Button
            variant="accent"
            className="mb-2.5"
            onClick={() =>
              navigate(`${ROUTES.celebration(challengeIdParam)}?scope=team`, {
                replace: true,
              })
            }
          >
            🎊 팀 전체도 달성했어요! 보러가기
          </Button>
        )}

        <Button
          variant={!isTeamScope && progress.isTeamAchieved ? 'ghost' : 'accent'}
          onClick={() => navigate(`/challenges/${challengeId}/feed`)}
        >
          팀 활동 피드 보기
        </Button>
      </PageContent>
    </MobileFrame>
  )
}
