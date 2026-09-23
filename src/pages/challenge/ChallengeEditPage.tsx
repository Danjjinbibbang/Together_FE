import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Toast } from '@/components/ui/Feedback'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useChallenge, useUpdateChallenge } from '@/hooks/useChallenges'
import { formatWon } from '@/lib/format'
import { applyServerFieldErrors, parseWon } from '@/lib/form'
import { ROUTES } from '@/routes/paths'

/** 필드명은 PATCH /challenges/{challengeId} 요청 바디와 같은 이름으로 맞춘다 */
interface ChallengeEditForm {
  title: string
  goalAmount: string
  startDate: string
  endDate: string
}

const FIELDS = ['title', 'goalAmount', 'startDate', 'endDate'] as const

/**
 * 21. 챌린지 정보 수정 (FR-036, 방장 전용).
 * 상세 화면 헤더는 일반 명사가 아니라 대상의 실제 이름을 쓴다 (NFR-008).
 *
 * 진행률은 서버 계산값(progressRate)을 그대로 쓴다 — 프론트에서 다시 계산하지 않는다.
 */
export function ChallengeEditPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const challengeQuery = useChallenge(challengeId)
  const updateChallenge = useUpdateChallenge(challengeId)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChallengeEditForm>({
    defaultValues: { title: '', goalAmount: '', startDate: '', endDate: '' },
  })

  // 서버 값이 도착하면 폼 초기값으로 채운다. 사용자가 이미 고쳤다면 reset이 덮지 않도록
  // challenge 객체가 바뀔 때만 실행한다.
  const challenge = challengeQuery.data
  useEffect(() => {
    if (!challenge) return
    reset({
      title: challenge.title,
      goalAmount: String(challenge.goalAmount),
      startDate: challenge.startDate,
      endDate: challenge.endDate,
    })
  }, [challenge, reset])

  const onSubmit = handleSubmit((values) =>
    updateChallenge.mutate(
      {
        title: values.title.trim(),
        goalAmount: parseWon(values.goalAmount),
        startDate: values.startDate,
        endDate: values.endDate,
      },
      {
        onSuccess: () =>
          navigate(ROUTES.challenge(challengeIdParam), { replace: true }),
        onError: (error) => applyServerFieldErrors(error, setError, FIELDS),
      },
    ),
  )

  return (
    <MobileFrame>
      <TopBar title={`${challenge?.title ?? '챌린지'} · 정보 수정`} showBack />

      <PageContent>
        <Badge tone="neutral" size="lg" className="mb-5">
          🔒 방장만 수정할 수 있어요
        </Badge>

        <AsyncBoundary query={challengeQuery}>
          {(data) => (
            <form id="challenge-edit" onSubmit={onSubmit} noValidate>
              <div className="border-border bg-surface mb-5 rounded-2xl border p-4">
                <div className="text-muted mb-2 flex justify-between text-xs">
                  <span>현재 진행률</span>
                  <span>
                    {data.totalBalance.toLocaleString('ko-KR')}원 /{' '}
                    {formatWon(data.goalAmount)}
                  </span>
                </div>
                <ProgressBar value={data.progressRate} />
              </div>

              <TextField
                label="챌린지 이름"
                error={errors.title?.message}
                {...register('title', {
                  required: '챌린지 이름을 입력해주세요.',
                  maxLength: {
                    value: 30,
                    message: '30자 이내로 입력해주세요.',
                  },
                })}
              />
              <TextField
                label="목표 금액"
                inputMode="numeric"
                helper="목표 금액을 낮추면 진행률이 자동으로 재계산돼요."
                error={errors.goalAmount?.message}
                {...register('goalAmount', {
                  required: '목표 금액을 입력해주세요.',
                  validate: (value) => {
                    const amount = parseWon(value)
                    if (Number.isNaN(amount)) return '숫자로 입력해주세요.'
                    if (amount < 1000) return '1,000원 이상으로 정해주세요.'
                    return true
                  },
                })}
              />

              <div className="mb-5">
                <p className="text-muted mb-2 text-[13px] font-bold">
                  챌린지 기간
                </p>
                <div className="flex items-center gap-2.5">
                  <TextField
                    type="date"
                    aria-label="시작일"
                    wrapperClassName="mb-0 flex-1"
                    className="text-center"
                    error={errors.startDate?.message}
                    {...register('startDate', {
                      required: '시작일을 선택해주세요.',
                    })}
                  />
                  <span className="text-muted" aria-hidden>
                    →
                  </span>
                  <TextField
                    type="date"
                    aria-label="종료일"
                    wrapperClassName="mb-0 flex-1"
                    className="text-center"
                    error={errors.endDate?.message}
                    {...register('endDate', {
                      required: '종료일을 선택해주세요.',
                      validate: (value, form) =>
                        !form.startDate ||
                        value > form.startDate ||
                        '종료일은 시작일보다 뒤여야 해요.',
                    })}
                  />
                </div>
                <p className="text-muted mt-2.5 text-center text-xs">
                  종료일을 이미 지난 날짜로 바꾸면 챌린지가 즉시 마감돼요.
                </p>
              </div>

              {updateChallenge.isError && (
                <Toast tone="error" className="mt-4">
                  ⚠{' '}
                  {getErrorMessage(updateChallenge.error, '수정하지 못했어요.')}
                </Toast>
              )}
            </form>
          )}
        </AsyncBoundary>
      </PageContent>

      <PageFooter>
        <Button
          type="submit"
          form="challenge-edit"
          disabled={updateChallenge.isPending || !challenge}
        >
          {updateChallenge.isPending ? '저장 중…' : '저장하기'}
        </Button>
      </PageFooter>
    </MobileFrame>
  )
}
