/**
 * JWT 저장소.
 *
 * 지금은 웹(localStorage) 구현이지만, Capacitor로 래핑한 뒤에는
 * @capacitor/preferences 또는 Secure Storage 플러그인으로 이 파일의 내부만 교체하면 된다.
 * 그래서 인터페이스를 처음부터 async로 잡아뒀다 — 네이티브 저장소 API가 전부 비동기이기 때문에,
 * 나중에 sync → async로 바꾸면 호출부를 전부 고쳐야 한다.
 */
const ACCESS_TOKEN_KEY = 'together.accessToken'
const REFRESH_TOKEN_KEY = 'together.refreshToken'

export interface TokenStorage {
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  setTokens(tokens: {
    accessToken: string
    refreshToken?: string
  }): Promise<void>
  clear(): Promise<void>
}

const webTokenStorage: TokenStorage = {
  async getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  async getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  async setTokens({ accessToken, refreshToken }) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },
  async clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

export const tokenStorage: TokenStorage = webTokenStorage
