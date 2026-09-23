import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { PageHeader } from '@/components/layout/TopBar'
import { Spinner } from '@/components/ui/Feedback'
import { useKakaoLogin } from '@/hooks/useAuth'
import { KAKAO_ACCESS_DENIED } from '@/lib/kakao'
import { ROUTES } from '@/routes/paths'

/**
 * 20. 카카오 인증 처리 중 (FR-030~032, FR-034).
 *
 * 카카오가 `?code=...`를 달고 되돌려보내는 지점이다.
 * 인가코드를 백엔드에 넘겨 JWT로 바꾸고, isNewUser에 따라 약관 동의(01) / 홈(03)으로 나눈다.
 * 실패하면 로그인 화면으로 되돌리며 사유를 함께 넘긴다.
 */
export function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const kakaoLogin = useKakaoLogin()

  const code = searchParams.get('code')
  const error = searchParams.get('error')

  /**
   * 인가코드는 일회용이라 같은 코드로 두 번 요청하면 두 번째가 실패한다.
   * StrictMode의 이펙트 이중 실행과 리렌더를 모두 막기 위해 한 번만 보낸다.
   */
  const requestedRef = useRef(false)

  useEffect(() => {
    if (requestedRef.current) return

    const backToLogin = (message: string) =>
      navigate(ROUTES.login, { replace: true, state: { loginError: message } })

    // 사용자가 동의 화면에서 취소했거나 카카오가 오류를 돌려준 경우
    if (error) {
      requestedRef.current = true
      backToLogin(
        error === KAKAO_ACCESS_DENIED
          ? '카카오 로그인을 취소했어요.'
          : '카카오 로그인에 실패했어요. 다시 시도해주세요.',
      )
      return
    }

    // 인가코드 없이 이 주소로 직접 들어온 경우
    if (!code) {
      requestedRef.current = true
      backToLogin('로그인 정보가 없어요. 다시 시도해주세요.')
      return
    }

    requestedRef.current = true
    kakaoLogin.mutate(
      { authorizationCode: code },
      {
        // 신규 가입자는 약관에 동의해야 서비스를 쓸 수 있다 (FR-028, FR-032)
        onSuccess: (data) =>
          navigate(data.isNewUser ? ROUTES.terms : ROUTES.home, {
            replace: true,
          }),
        onError: (mutationError) =>
          backToLogin(
            getErrorMessage(
              mutationError,
              '로그인에 실패했어요. 다시 시도해주세요.',
            ),
          ),
      },
    )
  }, [code, error, kakaoLogin, navigate])

  return (
    <MobileFrame>
      <PageHeader>로그인 처리 중</PageHeader>
      <div className="flex flex-1 flex-col items-center justify-center">
        <Spinner className="mb-6" />
        <h2 className="text-ink mb-1.5 text-[15px] font-extrabold">
          카카오 로그인 확인 중
        </h2>
        <p className="text-muted text-[12.5px]">잠시만 기다려주세요...</p>
      </div>
    </MobileFrame>
  )
}
