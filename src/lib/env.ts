/**
 * 환경변수 접근 지점. 컴포넌트에서 import.meta.env를 직접 읽지 말고 여기를 거친다.
 * 누락된 값은 앱 부팅 시점에 바로 터뜨려서, 런타임 중간에 undefined로 새는 걸 막는다.
 */
function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(
      `환경변수 ${key}가 설정되지 않았습니다. .env.example을 참고해 .env.local을 만들어주세요.`,
    )
  }
  return value
}

export const env = {
  /** 기본값 '/api' → vite dev 프록시를 통해 로컬 백엔드로 전달된다. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  get kakaoRestApiKey() {
    return required('VITE_KAKAO_REST_API_KEY')
  },
  get kakaoRedirectUri() {
    return required('VITE_KAKAO_REDIRECT_URI')
  },
  isDev: import.meta.env.DEV,
} as const
