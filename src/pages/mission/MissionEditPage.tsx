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
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { EmptyState, Spinner, Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { ToggleRow } from '@/components/ui/Toggle'
import { useMissions, useUpdateMission } from '@/hooks/useMissions'
import { applyServerFieldErrors } from '@/lib/form'

/** 보상 범위 제약 — 명세: 100 ≤ rewardMin ≤ rewardMax ≤ 10000 */
const REWARD_MIN = 100
const REWARD_MAX = 10_000

/** 필드명은 PATCH /missions/{missionId} 요청 바디와 같은 이름으로 맞춘다 */
interface MissionEditForm {
  title: string
  rewardMin: string
  rewardMax: string
  minTextLength: string
  isActive: boolean
}

const FIELDS = [
  'title',
  'rewardMin',
  'rewardMax',
  'minTextLength',
  'isActive',
] as const

/**
 * 25. 미션 수정 (방장 전용).
 *
 * ⚠️ 미션 단건 조회 API가 없어(`GET /missions/{missionId}` 부재) 챌린지의 미션 목록을
 * 받아 그 안에서 찾는다. 목록은 미션 관리(23)에서 이미 캐시돼 있어 대개 즉시 그려진다.
 */
export function MissionEditPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '', missionId: missionIdParam = '' } =
    useParams()
  const challengeId = Number(challengeIdParam)
  const missionId = Number(missionIdParam)

  const missionsQuery = useMissions(challengeId)
  const updateMission = useUpdateMission(challengeId)

  const mission = missionsQuery.data?.find(
    (item) => item.missionId === missionId,
  )
  const isPhoto = mission?.submitType === 'PHOTO'

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<MissionEditForm>({
    defaultValues: {
      title: '',
      rewardMin: '',
      rewardMax: '',
      minTextLength: '',
      isActive: true,
    },
  })

  const isActive = watch('isActive')

  useEffect(() => {
    if (!mission) return
    reset({
      title: mission.title,
      rewardMin: String(mission.rewardMin),
      rewardMax: String(mission.rewardMax),
      // 목록 응답에 minTextLength가 없어 현재 값을 채울 수 없다 (아래 주석 참고)
      minTextLength: '',
      isActive: mission.isActive,
    })
  }, [mission, reset])

  const onSubmit = handleSubmit((values) => {
    const minTextLength = values.minTextLength.trim()

    updateMission.mutate(
      {
        missionId,
        body: {
          title: values.title.trim(),
          rewardMin: Number(values.rewardMin),
          rewardMax: Number(values.rewardMax),
          /*
            PATCH는 보낸 필드만 수정하므로, 비워두면 아예 보내지 않아 기존 값이 남는다.
            현재 값을 못 보여주는 상황에서 0이나 빈 값을 보내면 조용히 덮어쓰게 된다.
            사진 미션은 글자수 제한 개념이 없어 null로 지운다.
          */
          ...(isPhoto
            ? { minTextLength: null }
            : minTextLength !== ''
              ? { minTextLength: Number(minTextLength) }
              : {}),
          isActive: values.isActive,
        },
      },
      {
        onSuccess: () => navigate(-1),
        onError: (error) => applyServerFieldErrors(error, setError, FIELDS),
      },
    )
  })

  if (missionsQuery.isPending) {
    return (
      <MobileFrame>
        <TopBar title="미션 수정" showBack />
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </MobileFrame>
    )
  }

  if (!mission) {
    return (
      <MobileFrame>
        <TopBar title="미션 수정" showBack />
        <PageContent>
          <EmptyState className="mt-6">
            미션을 찾을 수 없어요. 목록에서 다시 선택해주세요.
          </EmptyState>
        </PageContent>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame>
      <TopBar title={`${mission.title} · 수정`} showBack />

      <PageContent className="pb-8">
        <form id="mission-edit" onSubmit={onSubmit} noValidate>
          <TextField
            label="미션 제목"
            error={errors.title?.message}
            {...register('title', {
              required: '미션 제목을 입력해주세요.',
              maxLength: { value: 50, message: '50자 이내로 입력해주세요.' },
            })}
          />

          <div className="mb-5">
            <p className="text-muted mb-2 text-[13px] font-bold">
              보상 금액 범위
            </p>
            <div className="flex items-center gap-2.5">
              <TextField
                inputMode="numeric"
                aria-label="보상 최소 금액"
                wrapperClassName="mb-0 flex-1"
                className="text-center"
                error={errors.rewardMin?.message}
                {...register('rewardMin', {
                  required: '최소 금액을 입력해주세요.',
                  min: {
                    value: REWARD_MIN,
                    message: `${REWARD_MIN}원 이상이어야 해요.`,
                  },
                })}
              />
              <span className="text-muted" aria-hidden>
                ~
              </span>
              <TextField
                inputMode="numeric"
                aria-label="보상 최대 금액"
                wrapperClassName="mb-0 flex-1"
                className="text-center"
                error={errors.rewardMax?.message}
                {...register('rewardMax', {
                  required: '최대 금액을 입력해주세요.',
                  max: {
                    value: REWARD_MAX,
                    message: `${REWARD_MAX.toLocaleString('ko-KR')}원 이하여야 해요.`,
                  },
                  validate: (value, form) =>
                    Number(value) >= Number(form.rewardMin) ||
                    '최대 금액이 최소 금액보다 커야 해요.',
                })}
              />
            </div>
            <p className="text-muted mt-2.5 text-xs">
              완료 시 이 범위 안에서 랜덤으로 지급돼요
            </p>
          </div>

          {/*
            사진 미션에는 글자수 제한 개념이 없어 입력란 자체를 숨긴다.
            텍스트 미션이라도 현재 값을 채울 수 없다 — 미션 목록 응답에 minTextLength가
            없고 단건 조회 API도 없어서다. 그래서 필수가 아니라 "바꿀 때만" 입력받는다.
          */}
          {!isPhoto && (
            <TextField
              label="최소 글자 수"
              placeholder="바꿀 때만 입력하세요"
              inputMode="numeric"
              helper="현재 설정값은 API로 받을 수 없어 비워뒀어요. 비워두면 지금 값이 그대로 유지돼요."
              error={errors.minTextLength?.message}
              {...register('minTextLength', {
                validate: (value) =>
                  value.trim() === '' ||
                  Number(value) >= 1 ||
                  '1자 이상으로 정해주세요.',
              })}
            />
          )}

          <ToggleRow
            title="이 미션 활성화"
            description="꺼두면 오늘의 미션 뽑기에서 제외돼요"
            checked={isActive}
            onChange={(next) => setValue('isActive', next)}
          />

          <NoticeBox className="mt-5">
            💡 이미 이 미션으로 제출된 인증 기록은 비활성화해도 그대로 남아요.
            과거 기록·보상 내역엔 영향이 없어요.
          </NoticeBox>

          {/*
            삭제 API가 명세에 없다 (PATCH /missions/{missionId} 페이지: "완전 삭제(DELETE)는
            별도 미제공"). 눌러도 되는 것처럼 보이면 안 되므로 안내로 바꿨다 —
            신설되면 여기에 위험 구역 버튼을 되살리면 된다.
          */}
          <NoticeBox tone="info" className="mt-4">
            🗂 미션은 삭제할 수 없고 비활성화만 가능해요. 과거 인증 기록과 보상
            내역을 보존하기 위해서예요.
          </NoticeBox>

          {updateMission.isError && (
            <Toast tone="error" className="mt-4">
              ⚠ {getErrorMessage(updateMission.error, '수정하지 못했어요.')}
            </Toast>
          )}
        </form>
      </PageContent>

      <PageFooter>
        <Button
          type="submit"
          form="mission-edit"
          disabled={updateMission.isPending}
        >
          {updateMission.isPending ? '저장 중…' : '저장하기'}
        </Button>
      </PageFooter>
    </MobileFrame>
  )
}
