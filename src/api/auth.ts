import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  KakaoLoginRequest,
  KakaoLoginResponse,
  TermsAgreementRequest,
  TermsAgreementResponse,
} from '@/types/api'

/**
 * 카카오 인가코드로 로그인/회원가입 (FR-030~032).
 *
 * 이 요청만 인증이 필요 없다 — 아직 JWT가 없는 시점이다.
 * 응답에 refreshToken은 없다. 만료 시 재로그인이 MVP 정책이다 (v0.4 §4 미확정 → 확장 과제).
 */
export async function loginWithKakao(body: KakaoLoginRequest) {
  const { data } = await apiClient.post<KakaoLoginResponse>(
    ENDPOINTS.auth.kakao,
    body,
  )
  return data
}

/** 최초 가입자 약관 동의 처리 (FR-028, 화면 01) */
export async function agreeToTerms(body: TermsAgreementRequest) {
  const { data } = await apiClient.post<TermsAgreementResponse>(
    ENDPOINTS.auth.termsAgreement,
    body,
  )
  return data
}
