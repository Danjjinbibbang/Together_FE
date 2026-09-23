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
import { useJoinChallenge } from '@/hooks/useChallenges'
import { applyServerFieldErrors } from '@/lib/form'
import { ROUTES } from '@/routes/paths'

/** 필드명은 POST /challenges/{challengeId}/join 요청 바디와 같은 이름으로 맞춘다 */
interface ChallengeJoinForm {
  inviteCode: string
  nickname: string
}

const FIELDS = ['inviteCode', 'nickname'] as const

/**
 * 07. 초대코드로 참여 (FR-002, FR-003).
 *
 * ⚠️ 이 화면은 API가 없어 아직 완결되지 않는다.
 *
 * `POST /challenges/{challengeId}/join`은 경로에 challengeId를 요구하는데,
 * 사용자가 가진 건 초대코드뿐이다. **초대코드로 챌린지를 찾는 엔드포인트가 없어**
 * 코드 → challengeId 변환이 불가능하다. 초대 링크(`/join?code=...`)도 코드만 실어
 * 보내므로 같은 벽에 부딪힌다.
 *
 * 그래서 폼·검증·에러 처리는 모두 붙여두고 제출만 막아뒀다.
 * `GET /challenges/by-invite-code/{inviteCode}`(가칭)가 생기면
 * 아래 resolvedChallengeId 자리에 그 조회를 끼우면 끝난다.
 */
export function ChallengeJoinPage() {
  const navigate = useNavigate()

  // TODO(API 신설 후): 초대코드 조회 결과의 challengeId로 교체할 것.
  const resolvedChallengeId: number | null = null
  const joinChallenge = useJoinChallenge(resolvedChallengeId ?? 0)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChallengeJoinForm>({
    defaultValues: { inviteCode: '', nickname: '' },
  })

  const onSubmit = handleSubmit((values) => {
    if (resolvedChallengeId == null) return
    joinChallenge.mutate(
      {
        inviteCode: values.inviteCode.trim().toUpperCase(),
        nickname: values.nickname.trim(),
      },
      {
        onSuccess: (member) =>
          navigate(ROUTES.challenge(String(member.challengeId)), {
            replace: true,
          }),
        // 닉네임 중복은 409로 오고 errors 맵이 없어 토스트로 떨어진다
        onError: (error) => applyServerFieldErrors(error, setError, FIELDS),
      },
    )
  })

  return (
    <MobileFrame>
      <TopBar title="초대코드로 참여" showBack />

      <PageContent>
        <form id="challenge-join" onSubmit={onSubmit} noValidate>
          <TextField
            label="초대코드 입력"
            emphasis="focused"
            align="code"
            placeholder="JEJU2026"
            autoCapitalize="characters"
            error={errors.inviteCode?.message}
            {...register('inviteCode', {
              required: '초대코드를 입력해주세요.',
              setValueAs: (value: string) => value.toUpperCase(),
            })}
          />

          <TextField
            label="이 챌린지에서 쓸 닉네임"
            placeholder="예: 헬스가는영희"
            error={errors.nickname?.message}
            {...register('nickname', {
              required: '닉네임을 입력해주세요.',
              maxLength: { value: 20, message: '20자 이내로 입력해주세요.' },
            })}
          />

          <NoticeBox tone="info">
            💡 닉네임은 챌린지마다 따로 정해요. 이미 팀에 있는 닉네임과 같으면
            참여할 수 없어요.
          </NoticeBox>

          {resolvedChallengeId == null && (
            <NoticeBox className="mt-4">
              ⚠️ 초대코드로 챌린지를 찾는 API가 아직 없어 참여를 완료할 수
              없어요. 백엔드에 요청해둔 상태예요.
            </NoticeBox>
          )}

          {joinChallenge.isError && (
            <Toast tone="error" className="mt-4">
              ⚠ {getErrorMessage(joinChallenge.error, '참여하지 못했어요.')}
            </Toast>
          )}
        </form>
      </PageContent>

      <PageFooter>
        <Button
          type="submit"
          form="challenge-join"
          disabled={resolvedChallengeId == null || joinChallenge.isPending}
        >
          {joinChallenge.isPending ? '참여하는 중…' : '참여하기'}
        </Button>
      </PageFooter>
    </MobileFrame>
  )
}
