import { useLocation } from 'react-router-dom'

import { MobileFrame } from '@/components/layout/MobileFrame'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Feedback'
import { buildKakaoAuthorizeUrl } from '@/lib/kakao'

/** 콜백(20)에서 실패하고 돌아올 때 넘겨주는 사유 (FR-034) */
interface LoginState {
  loginError?: string
}

/**
 * 19. 로그인 — 앱 최초 진입점 (FR-029, FR-030).
 *
 * 카카오 인가 화면으로 페이지를 통째로 넘긴다. 돌아오는 곳은 화면 20이다.
 * navigate가 아니라 location.href인 이유: 인가 화면은 외부(kauth.kakao.com) 문서라
 * SPA 라우터가 다룰 대상이 아니다.
 */
export function LoginPage() {
  const { state } = useLocation() as { state: LoginState | null }

  return (
    <MobileFrame background="brand">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="bg-accent mb-5 flex size-24 items-center justify-center rounded-[28px] text-[44px]">
          🐷
        </div>
        <h1 className="text-[22px] font-extrabold text-white">같이모으기</h1>
        <p className="mt-2 text-[13px] text-white/80">
          친구와 함께, 미션으로 모으는 저축
        </p>
      </div>

      <div className="safe-bottom px-7 pb-10">
        {state?.loginError && (
          <Toast tone="error" className="mb-4">
            ⚠ {state.loginError}
          </Toast>
        )}

        <Button
          variant="kakao"
          onClick={() => {
            window.location.href = buildKakaoAuthorizeUrl()
          }}
          className="font-extrabold"
        >
          <span className="text-lg" aria-hidden>
            💬
          </span>
          카카오로 시작하기
        </Button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/70">
          시작하면 서비스 이용약관 및
          <br />
          개인정보 처리방침에 동의하게 돼요
        </p>
      </div>
    </MobileFrame>
  )
}
