/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 베이스 URL. 비워두면 '/api'로 두고 vite dev 프록시를 탄다. */
  readonly VITE_API_BASE_URL?: string
  /**
   * 카카오 REST API 키.
   * 인가코드 요청(kauth.kakao.com/oauth/authorize)의 client_id로 쓴다.
   * 토큰 교환은 백엔드가 client_secret과 함께 처리하므로 이 키는 노출되어도 된다.
   */
  readonly VITE_KAKAO_REST_API_KEY: string
  /** 카카오 로그인 리다이렉트 URI */
  readonly VITE_KAKAO_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
