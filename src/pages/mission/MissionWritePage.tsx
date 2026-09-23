import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { TodayMissionBanner } from '@/components/domain/MissionCard'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextAreaField } from '@/components/ui/Field'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { Toast } from '@/components/ui/Feedback'
import { ToggleRow } from '@/components/ui/Toggle'
import { useGoalProgress } from '@/hooks/useGoalProgress'
import { useSubmitMission, useTodayMission } from '@/hooks/useMissions'
import { getErrorMessage } from '@/api/client'
import { ROUTES } from '@/routes/paths'

/** 11. 미션 작성 (FR-011, FR-015) */
export function MissionWritePage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const todayQuery = useTodayMission(challengeId)
  const submitMission = useSubmitMission(challengeId)

  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  // 배정이 없으면(활성 미션 0개) 이 화면에 올 일이 없다 — 뽑기 화면(10)에서 막힌다
  const today = todayQuery.data?.hasActiveMission ? todayQuery.data : undefined
  const minLength = today?.minTextLength ?? 0
  const isPhoto = today?.submitType === 'PHOTO'

  // 목표를 채운 멤버는 제출할 수 없다 (FR-045). 서버도 막아야 하지만 화면에서 먼저 알린다.
  const { isMineAchieved } = useGoalProgress(challengeId)

  // 사진 미션은 업로드 연동 전이라 본문 없이도 제출할 수 있게 둔다
  const canSubmit = !isMineAchieved && (isPhoto || content.length >= minLength)

  const handleSubmit = () => {
    if (!today) return
    submitMission.mutate(
      {
        missionId: today.missionId,
        body: { submitContent: content, isPublic },
      },
      {
        onSuccess: (result) =>
          /*
            결과 화면(12)이 승인/심사중을 구분해 그리도록 상태를 넘긴다.
            보상 금액은 제출 응답에 없으므로 missionLogId도 함께 넘겨
            결과 화면이 로그 상세로 실제 금액을 읽게 한다.
          */
          navigate(ROUTES.missionResult(String(challengeId)), {
            replace: true,
            state: {
              status: result.status,
              missionLogId: result.missionLogId,
            },
          }),
      },
    )
  }

  return (
    <MobileFrame>
      <TopBar
        title="미션 작성"
        showBack
        right={
          <Badge tone="primary" size="md">
            {isPhoto ? '📷 사진' : '📝 텍스트'}
          </Badge>
        }
      />

      <PageContent>
        <AsyncBoundary query={todayQuery}>
          {() => (
            <>
              <TodayMissionBanner title={today?.title ?? '오늘의 미션'} />

              {isMineAchieved && (
                <NoticeBox className="mb-4">
                  🏆 목표를 다 모아서 더 이상 제출할 수 없어요. 팀원의 기록에
                  리액션과 댓글로 응원해주세요.
                </NoticeBox>
              )}

              {isPhoto && (
                <NoticeBox className="mb-4">
                  💡 사진 인증은 확인이 끝난 뒤 보상이 지급돼요. 결과는 알림으로
                  알려드릴게요.
                </NoticeBox>
              )}

              <TextAreaField
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  isPhoto
                    ? '사진과 함께 남길 메모가 있다면 적어보세요 (선택)'
                    : `여기에 자유롭게 적어보세요 (최소 ${minLength}자)`
                }
                counter={
                  isPhoto
                    ? undefined
                    : `${content.length} / 최소 ${minLength}자`
                }
                wrapperClassName="mb-0"
              />

              <ToggleRow
                title="공개로 작성하기"
                description="팀원이 내 미션 내용을 볼 수 있어요"
                checked={isPublic}
                onChange={setIsPublic}
              />
            </>
          )}
        </AsyncBoundary>

        {submitMission.isError && (
          <Toast tone="error" className="mt-4">
            ⚠ {getErrorMessage(submitMission.error, '제출하지 못했어요.')}
          </Toast>
        )}
      </PageContent>

      <PageFooter>
        <Button
          disabled={!canSubmit || submitMission.isPending}
          onClick={handleSubmit}
        >
          {submitMission.isPending ? '제출 중…' : '제출하기'}
        </Button>
      </PageFooter>
    </MobileFrame>
  )
}
