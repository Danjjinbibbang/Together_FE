import { useMutation } from '@tanstack/react-query'

import { agreeToTerms, loginWithKakao } from '@/api/auth'
import { queryClient } from '@/api/queryClient'
import { useAuthStore } from '@/store/authStore'
import type { KakaoLoginRequest, TermsAgreementRequest } from '@/types/api'

/**
 * 카카오 인가코드로 로그인 (FR-030~032).
 *
 * 성공 시 JWT를 저장소에 넣고 세션 상태를 authenticated로 올린다.
 * 응답의 isNewUser로 약관 동의(화면 01) / 홈(화면 03) 분기는 호출부에서 한다.
 */
export function useKakaoLogin() {
  const signIn = useAuthStore((state) => state.signIn)

  return useMutation({
    mutationFn: (body: KakaoLoginRequest) => loginWithKakao(body),
    onSuccess: async (data) => {
      // 이전 사용자의 캐시가 남아 새 세션에 비치지 않도록 비운다
      queryClient.clear()
      await signIn({ accessToken: data.accessToken })
    },
  })
}

/** 최초 가입자 약관 동의 (FR-028, 화면 01) */
export function useAgreeToTerms() {
  return useMutation({
    mutationFn: (body: TermsAgreementRequest) => agreeToTerms(body),
  })
}
