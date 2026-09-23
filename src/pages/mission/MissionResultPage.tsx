import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { StatusStamp } from '@/components/domain/StatusStamp'
import { useMyAccount } from '@/hooks/useAccounts'
import { useChallenge } from '@/hooks/useChallenges'
import { useMissionLog } from '@/hooks/useMissionLogs'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { PageHeader } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { formatSignedWon, formatWon } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import type { MissionLogStatus } from '@/types/api'

/** 제출 직후 넘어오는 값 — POST /missions/{id}/submit 응답 */
interface ResultState {
  status?: MissionLogStatus
  missionLogId?: number
}

/**
 * 12. 미션 완료 결과.
 *
 * 제출 형식에 따라 도착하는 상태가 다르다 (백엔드 §13):
 *   - 텍스트 미션 → 최소 글자수를 채우면 즉시 AI_APPROVED, 보상도 그 자리에서 지급
 *   - 사진 미션   → AI 판별 연동 전이라 SUBMITTED에 머무름. 보상 미지급
 * 두 경우를 모두 받을 수 있어야 한다.
 */
export function MissionResultPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)
  const { state } = useLocation() as { state: ResultState | null }

  /*
    제출 응답에는 status와 missionLogId만 있다. 보상 금액과 미션 제목은
    로그 상세에서 읽는다 — 금액은 완료 시점에야 공개되는 값이라 그 전 화면에는 없다.
    잔액·스트릭도 방금 바뀌었는데, useSubmitMission이 성공 시 관련 쿼리를 무효화해두므로
    여기서는 읽기만 하면 최신값이 온다.
  */
  const logQuery = useMissionLog(state?.missionLogId ?? Number.NaN)
  const accountQuery = useMyAccount(challengeId)
  const challengeQuery = useChallenge(challengeId)

  const log = logQuery.data
  const status = log?.status ?? state?.status ?? 'AI_APPROVED'
  const isApproved = status === 'AI_APPROVED' || status === 'OWNER_APPROVED'

  /*
    이번 입금으로 **내가** 목표를 채웠는지 (FR-026 + FR-045).

    goalAmount는 팀 합산이 아니라 1인당 목표라 내 계좌 잔액이 기준이다.
    "지금 넘었다"만 잡아야 한다: 이미 달성한 뒤에도 축하가 다시 뜨면 안 되므로,
    지금 잔액이 목표 이상이면서 이번 보상을 빼면 목표 미만이었던 경우만 통과시킨다.
    반려된 미션은 지급 자체가 없으니 애초에 대상이 아니다.

    팀 달성 축하는 여기서 띄우지 않는다 — 내가 마지막 주자였다면 개인 축하 화면이
    "팀 전체도 달성했어요" 버튼으로 이어준다. 축하 두 개를 연달아 밀어붙이지 않기 위해서다.
  */
  const challenge = challengeQuery.data
  const myBalance = accountQuery.data?.balance
  const justReachedGoal =
    isApproved &&
    challenge != null &&
    log != null &&
    myBalance != null &&
    myBalance >= challenge.goalAmount &&
    myBalance - log.rewardAmount < challenge.goalAmount

  // 데이터가 늦게 도착해도 한 번만 보낸다. replace를 쓰지 않아 축하 화면의 ✕가 여기로 돌아온다.
  const celebratedRef = useRef(false)
  useEffect(() => {
    if (!justReachedGoal || celebratedRef.current) return
    celebratedRef.current = true
    navigate(ROUTES.celebration(challengeIdParam))
  }, [justReachedGoal, navigate, challengeIdParam])

  return (
    <MobileFrame>
      <PageHeader>
        {log?.missionTitle ?? '오늘의 미션'} · {isApproved ? '완료' : '제출됨'}
      </PageHeader>

      <PageContent className="px-6 pt-10 text-center">
        <StatusStamp status={status} className="mb-5" />

        {isApproved ? (
          <>
            <div className="bg-accent mx-auto mb-5 flex size-25 items-center justify-center rounded-full text-[44px] shadow-[0_12px_30px_rgba(255,190,15,.4)]">
              🪙
            </div>
            <p className="text-primary-dark mb-1.5 text-3xl font-extrabold">
              {log ? formatSignedWon(log.rewardAmount) : '…'}
            </p>
            <p className="text-muted mb-7 text-[13px]">
              미션을 완료하고 가상 계좌에 입금됐어요
            </p>
          </>
        ) : (
          <>
            <div className="bg-ai-tint mx-auto mb-5 flex size-25 items-center justify-center rounded-full text-[44px]">
              🔍
            </div>
            <p className="text-ink mb-1.5 text-xl font-extrabold">
              인증을 확인하고 있어요
            </p>
            <p className="text-muted mb-6 text-[13px] leading-relaxed">
              사진 미션은 확인이 끝난 뒤에 보상이 지급돼요.
              <br />
              결과는 알림으로 알려드릴게요.
            </p>
            <NoticeBox className="mb-7 text-left">
              💡 확인이 끝나면 오늘의 보상이 계좌에 입금돼요. 혹시 반려되면
              이의제기를 할 수 있어요.
            </NoticeBox>
          </>
        )}

        <Card padding="md" radius="md" className="mb-7 flex justify-between">
          <div className="text-left">
            <p className="text-muted text-[11px]">현재 잔액</p>
            <p className="text-ink mt-1 text-[15px] font-extrabold">
              {accountQuery.data ? formatWon(accountQuery.data.balance) : '…'}
            </p>
          </div>
          <div className="text-left">
            <p className="text-muted text-[11px]">이 챌린지 연속 기록</p>
            <p className="text-ink mt-1 text-[15px] font-extrabold">
              {challengeQuery.data
                ? `${challengeQuery.data.myStreak}일 🔥`
                : '…'}
            </p>
          </div>
        </Card>

        {/*
          AI가 반려한 경우 여기서 바로 이의제기로 이어준다 (FR-012a).
          실제 흐름은 미션 상세(14)에 있다 — 사진 미션은 반려가 나중에 도착해
          알림으로 그 화면에 들어오는 경우가 많아 한곳에 모아뒀다.
        */}
        {status === 'AI_REJECTED' && state?.missionLogId != null && (
          <Button
            className="mb-2.5"
            onClick={() =>
              navigate(ROUTES.missionLog(String(state.missionLogId)))
            }
          >
            🙋 이의제기하기
          </Button>
        )}

        <div className="flex gap-2.5">
          <Button
            variant="ghost"
            size="md"
            className="flex-1"
            onClick={() => navigate(ROUTES.account(challengeIdParam, 'me'))}
          >
            계좌 상세 보기
          </Button>
          <Button
            size="md"
            className="flex-1"
            onClick={() => navigate(ROUTES.challenge(challengeIdParam))}
          >
            그룹 홈으로
          </Button>
        </div>
      </PageContent>
    </MobileFrame>
  )
}
