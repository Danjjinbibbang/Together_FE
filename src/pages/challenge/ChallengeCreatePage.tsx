import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { useCreateChallenge } from '@/hooks/useChallenges'
import { applyServerFieldErrors, parseWon } from '@/lib/form'
import { ROUTES } from '@/routes/paths'

/** 필드명은 POST /challenges 요청 바디와 같은 이름으로 맞춘다 (서버 에러 매핑용) */
interface ChallengeCreateForm {
  nickname: string
  title: string
  /** 사용자는 "300,000원"처럼 치므로 문자열로 받고 제출 직전에 숫자로 바꾼다 */
  goalAmount: string
  startDate: string
  endDate: string
}

const FIELDS = [
  'nickname',
  'title',
  'goalAmount',
  'startDate',
  'endDate',
] as const

/**
 * 05. 챌린지 생성 (FR-001).
 * v0.4 FR-003에 따라 이 챌린지에서 쓸 닉네임을 여기서 함께 받는다.
 *
 * 생성 응답의 challengeId로 다음 단계를 이어간다 — 이 값이 있어야
 * 미션 운영 방식(09) → 미션 등록(24) → 초대코드(06)가 같은 챌린지를 가리킨다.
 */
export function ChallengeCreatePage() {
  const navigate = useNavigate()
  const createChallenge = useCreateChallenge()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChallengeCreateForm>({
    defaultValues: {
      nickname: '',
      title: '',
      goalAmount: '',
      startDate: '',
      endDate: '',
    },
  })

  const onSubmit = handleSubmit((values) =>
    createChallenge.mutate(
      {
        title: values.title.trim(),
        goalAmount: parseWon(values.goalAmount),
        startDate: values.startDate,
        endDate: values.endDate,
        nickname: values.nickname.trim(),
      },
      {
        /*
          생성 직후 바로 초대코드로 가지 않는다.
          미션 운영 방식(09) → 미션 등록(24)을 거쳐야 초대 단계로 넘어간다 —
          미션 0개인 챌린지에 친구가 들어오는 상황을 막기 위해서다.
        */
        onSuccess: (challenge) =>
          navigate(
            `${ROUTES.missionMode(String(challenge.challengeId))}?setup=1`,
            { replace: true },
          ),
        onError: (error) => applyServerFieldErrors(error, setError, FIELDS),
      },
    ),
  )

  return (
    <MobileFrame>
      <TopBar title="챌린지 만들기" showBack />

      <PageContent>
        <form id="challenge-create" onSubmit={onSubmit} noValidate>
          <TextField
            label="내 닉네임 (이 챌린지에서 사용)"
            placeholder="예: 짠돌이철수"
            error={errors.nickname?.message}
            {...register('nickname', {
              required: '닉네임을 입력해주세요.',
              maxLength: { value: 20, message: '20자 이내로 입력해주세요.' },
            })}
          />
          <TextField
            label="챌린지 이름"
            placeholder="예: 제주도 여행 저축 모임"
            error={errors.title?.message}
            {...register('title', {
              required: '챌린지 이름을 입력해주세요.',
              maxLength: { value: 30, message: '30자 이내로 입력해주세요.' },
            })}
          />
          <TextField
            label="목표 금액"
            placeholder="예: 300,000원"
            inputMode="numeric"
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
            <p className="text-muted mb-2 block text-[13px] font-bold">
              챌린지 기간
            </p>
            <div className="flex gap-2.5">
              {/* type="date"라 사용자가 어떤 형식으로 치든 "2026-09-01"로 들어온다 */}
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
          </div>

          <NoticeBox>
            💡 하루 최대 10,000원까지 보상받을 수 있어요. 목표 30만원 기준,
            평균적으로 약 100일 정도 걸려요.
          </NoticeBox>

          {/* 필드에 못 붙는 오류(권한·서버 오류·필드 조합 검증)는 여기로 모인다 */}
          {createChallenge.isError && (
            <Toast tone="error" className="mt-4">
              ⚠{' '}
              {getErrorMessage(
                createChallenge.error,
                '챌린지를 만들지 못했어요.',
              )}
            </Toast>
          )}
        </form>
      </PageContent>

      <PageFooter>
        <Button
          type="submit"
          form="challenge-create"
          disabled={createChallenge.isPending}
        >
          {createChallenge.isPending ? '만드는 중…' : '다음 · 미션 정하기'}
        </Button>
      </PageFooter>
    </MobileFrame>
  )
}
