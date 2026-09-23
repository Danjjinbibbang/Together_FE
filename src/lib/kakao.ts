import { env } from '@/lib/env'

/**
 * 카카오 인가코드 요청 URL (FR-030).
 *
 * SDK를 쓰지 않고 인가 엔드포인트로 직접 보낸다. 프론트는 인가코드만 받아 백엔드에 넘기고,
 * 카카오 토큰 교환은 백엔드가 client_secret과 함께 처리한다(POST /auth/kakao).
 * 그래서 여기 노출되는 REST API 키만으로는 토큰을 발급받을 수 없다.
 *
 * SDK 대신 리다이렉트를 택한 이유: 스크립트 로드·초기화 없이 동작해
 * Capacitor WebView에서도 추가 설정이 필요 없다.
 */
export function buildKakaoAuthorizeUrl() {
  const params = new URLSearchParams({
    client_id: env.kakaoRestApiKey,
    redirect_uri: env.kakaoRedirectUri,
    response_type: 'code',
  })
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}

/** 사용자가 카카오 동의 화면에서 취소했을 때 오는 error 코드 (FR-034) */
export const KAKAO_ACCESS_DENIED = 'access_denied'
