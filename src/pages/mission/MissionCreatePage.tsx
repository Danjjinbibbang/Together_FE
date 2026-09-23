import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { BigTabs, ChipGroup, SelectableRow } from '@/components/ui/Choice'
import { TextField } from '@/components/ui/Field'
import { Toast } from '@/components/ui/Feedback'
import { useCreateMission, useGenerateAiMissions } from '@/hooks/useMissions'
import { formatWonRange } from '@/lib/format'
import { applyServerFieldErrors } from '@/lib/form'
import { ROUTES } from '@/routes/paths'
import type { SubmitType } from '@/types/api'

type CreateMode = 'owner' | 'ai'

/** 보상 범위 제약 — 명세: 100 ≤ rewardMin ≤ rewardMax ≤ 10000 */
const REWARD_MIN = 100
const REWARD_MAX = 10_000

/** 필드명은 POST /challenges/{id}/missions 요청 바디와 같은 이름으로 맞춘다 */
interface MissionCreateForm {
  title: string
  submitType: SubmitType
  rewardMin: string
  rewardMax: string
  minTextLength: string
}

const FIELDS = [
  'title',
  'submitType',
  'rewardMin',
  'rewardMax',
  'minTextLength',
] as const

/**
 * 24. 미션 생성 (FR-009).
 * v0.4에서 AI 생성이 확장 과제 → MVP로 승격되어, 직접 만들기와 나란히 제공된다.
 * AI가 만든 미션도 방장이 검토·선택한 것만 등록된다 (ai-generate는 저장하지 않는 2단계 흐름).
 */
export function MissionCreatePage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)
  const [searchParams] = useSearchParams()
  // 생성 플로우 중이면 미션을 등록해야만 초대코드 단계로 넘어간다
  const isSetup = searchParams.get('setup') === '1'

  const [mode, setMode] = useState<CreateMode>('owner')
  const [theme, setTheme] = useState('')
  // AI 제안 응답에는 아직 저장 전이라 id가 없다. 선택은 인덱스로 관리한다.
  const [picked, setPicked] = useState<number[]>([])

  const generateAiMissions = useGenerateAiMissions(challengeId)
  const createMission = useCreateMission(challengeId)
  const suggestions = generateAiMissions.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<MissionCreateForm>({
    defaultValues: {
      title: '',
      submitType: 'TEXT',
      rewardMin: '',
      rewardMax: '',
      minTextLength: '',
    },
  })

  const submitType = watch('submitType')

  const togglePick = (index: number) =>
    setPicked((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    )

  /** 등록 후 갈 곳 — 생성 플로우면 초대코드(06), 아니면 왔던 화면 */
  const afterCreate = () =>
    isSetup
      ? navigate(ROUTES.challengeInvite(challengeIdParam), { replace: true })
      : navigate(-1)

  const submitOwnerMission = handleSubmit((values) =>
    createMission.mutate(
      {
        title: values.title.trim(),
        submitType: values.submitType,
        rewardMin: Number(values.rewardMin),
        rewardMax: Number(values.rewardMax),
        // PHOTO 미션은 글자수 제한이 없다 (명세상 null 허용)
        minTextLength:
          values.submitType === 'TEXT' ? Number(values.minTextLength) : null,
      },
      {
        onSuccess: afterCreate,
        onError: (error) => applyServerFieldErrors(error, setError, FIELDS),
      },
    ),
  )

  /**
   * 고른 AI 제안을 하나씩 등록한다.
   *
   * 여러 건을 한 번에 넣는 API가 없어 순차 호출한다. 중간에 실패하면 거기서 멈추므로
   * 앞의 몇 건은 이미 저장된 상태다 — 목록(23)에서 확인하면 된다.
   */
  const registerPickedSuggestions = async () => {
    try {
      for (const index of [...picked].sort((a, b) => a - b)) {
        const suggestion = suggestions[index]
        if (!suggestion) continue
        await createMission.mutateAsync({
          title: suggestion.title,
          submitType: suggestion.submitType,
          rewardMin: suggestion.suggestedRewardMin,
          rewardMax: suggestion.suggestedRewardMax,
          minTextLength: suggestion.submitType === 'TEXT' ? 30 : null,
        })
      }
      afterCreate()
    } catch {
      // 실패 문구는 아래 Toast가 mutation 상태를 보고 그린다
    }
  }

  return (
    <MobileFrame>
      <TopBar title={isSetup ? '미션 등록 (3/3)' : '새 미션 만들기'} showBack />

      <BigTabs
        value={mode}
        onChange={setMode}
        items={[
          {
            value: 'owner',
            emoji: '✍️',
            label: '직접 만들기',
            description: '내가 직접 작성',
          },
          {
            value: 'ai',
            emoji: '✨',
            label: 'AI로 생성하기',
            description: '테마만 정하면 끝',
          },
        ]}
      />

      <PageContent>
        {mode === 'owner' ? (
          <form id="mission-create" onSubmit={submitOwnerMission} noValidate>
            <TextField
              label="미션 제목"
              placeholder="예: 오늘 감사한 점 3가지 적기"
              error={errors.title?.message}
              {...register('title', {
                required: '미션 제목을 입력해주세요.',
                maxLength: { value: 50, message: '50자 이내로 입력해주세요.' },
              })}
            />

            <div className="mb-5">
              <p className="text-muted mb-2 text-[13px] font-bold">제출 형식</p>
              {/*
                ChipGroup은 input이 아니라 버튼 묶음이라 register()를 붙일 수 없다.
                defaultValues에 있는 필드는 register 없이도 제출 값에 포함되므로
                setValue로 직접 넣고 watch로 읽는다.
              */}
              <ChipGroup
                value={submitType}
                onChange={(value) => setValue('submitType', value)}
                items={[
                  { value: 'TEXT' as SubmitType, label: '📝 텍스트' },
                  { value: 'PHOTO' as SubmitType, label: '📷 사진' },
                ]}
              />
            </div>

            {submitType === 'TEXT' && (
              <TextField
                label="최소 글자 수"
                placeholder="예: 30"
                inputMode="numeric"
                error={errors.minTextLength?.message}
                {...register('minTextLength', {
                  required: '최소 글자 수를 입력해주세요.',
                  min: { value: 1, message: '1자 이상으로 정해주세요.' },
                })}
              />
            )}

            {/* 실제 지급액은 이 범위 안에서 배정 시점에 랜덤으로 정해진다 (FR-013) */}
            <div className="mb-5">
              <p className="text-muted mb-2 text-[13px] font-bold">
                보상 금액 범위
              </p>
              <div className="flex items-center gap-2.5">
                <TextField
                  placeholder="최소 100"
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
                  placeholder="최대 10,000"
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
                미션을 완료하면 이 범위 안에서 금액이 랜덤으로 정해져요 (100원 ~
                10,000원)
              </p>
            </div>
          </form>
        ) : (
          <>
            <div className="bg-ai-tint mb-5 rounded-2xl border-[1.5px] border-[#DCCFFB] p-4">
              <p className="text-ai mb-3 text-[13px] font-extrabold">
                ✨ 어떤 테마의 미션을 원하시나요?
              </p>
              <input
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                placeholder="예: 운동, 절약, 독서"
                aria-label="미션 테마"
                className="bg-surface w-full rounded-[10px] border-[1.5px] border-[#DCCFFB] px-3.5 py-3 text-[13px] outline-none"
              />
              <Button
                size="md"
                className="bg-ai mt-3 w-full text-white"
                disabled={!theme.trim() || generateAiMissions.isPending}
                onClick={() =>
                  // 제안을 새로 받으면 이전 목록 기준의 선택은 의미가 없다
                  generateAiMissions.mutate(
                    { theme: theme.trim() },
                    { onSuccess: () => setPicked([]) },
                  )
                }
              >
                {generateAiMissions.isPending
                  ? '생성 중…'
                  : '테마로 미션 생성하기'}
              </Button>
            </div>

            {generateAiMissions.isError && (
              <Toast tone="error" className="mb-4">
                ⚠{' '}
                {getErrorMessage(
                  generateAiMissions.error,
                  '미션을 생성하지 못했어요.',
                )}
              </Toast>
            )}

            {suggestions.length > 0 && (
              <p className="text-muted mb-3 text-[13px] font-bold">
                생성된 미션 중 추가할 것을 선택하세요
              </p>
            )}

            {suggestions.map((suggestion, index) => (
              <SelectableRow
                key={suggestion.title}
                control="check"
                selected={picked.includes(index)}
                onSelect={() => togglePick(index)}
              >
                <span className="text-ink block text-[13px] font-bold">
                  {suggestion.title}
                </span>
                <span className="text-muted mt-0.5 block text-[11.5px]">
                  {suggestion.submitType === 'TEXT' ? '📝 텍스트' : '📷 사진'} ·
                  🪙{' '}
                  {formatWonRange(
                    suggestion.suggestedRewardMin,
                    suggestion.suggestedRewardMax,
                  )}
                </span>
              </SelectableRow>
            ))}
          </>
        )}

        {createMission.isError && (
          <Toast tone="error" className="mt-4">
            ⚠{' '}
            {getErrorMessage(createMission.error, '미션을 등록하지 못했어요.')}
          </Toast>
        )}
      </PageContent>

      <PageFooter>
        {mode === 'owner' ? (
          <Button
            type="submit"
            form="mission-create"
            disabled={createMission.isPending}
          >
            {createMission.isPending
              ? '등록 중…'
              : isSetup
                ? '등록하고 친구 초대하기'
                : '미션 추가하기'}
          </Button>
        ) : (
          <Button
            disabled={picked.length === 0 || createMission.isPending}
            onClick={() => void registerPickedSuggestions()}
          >
            {createMission.isPending
              ? '등록 중…'
              : isSetup
                ? `${picked.length}개 등록하고 친구 초대하기`
                : `${picked.length}개 미션 추가하기`}
          </Button>
        )}
      </PageFooter>
    </MobileFrame>
  )
}
