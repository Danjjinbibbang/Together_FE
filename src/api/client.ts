import axios, { AxiosError, type AxiosInstance } from 'axios'

import { env } from '@/lib/env'
import { tokenStorage } from '@/lib/tokenStorage'

/**
 * 401 발생 시 실행할 콜백. axios는 React 밖에 있어서 라우터를 직접 못 쓴다.
 * App 부팅 시 registerUnauthorizedHandler로 주입한다.
 */
let onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터: 저장된 JWT를 Authorization 헤더에 자동 첨부
apiClient.interceptors.request.use(async (config) => {
  const accessToken = await tokenStorage.getAccessToken()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

// 응답 인터셉터: 401이면 토큰을 버리고 로그인 화면으로 보낸다.
//
// TODO(API 명세 확정 후): refresh 토큰으로 재발급 후 원요청 재시도하는 흐름 추가.
//   현재는 refresh 엔드포인트 경로/응답 형태가 Notion API 명세에 없어서 구현하지 않았다.
//   추측해서 만들지 말고 명세를 먼저 확인할 것.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await tokenStorage.clear()
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

/**
 * 서버 에러 응답 (RFC 7807 ProblemDetail).
 * 형식은 Notion "claude 컨텍스트" §14 프론트 연동 가이드 기준이다.
 */
interface ProblemDetail {
  title?: string
  status?: number
  /** 그대로 토스트에 써도 되는 한글 문장 */
  detail?: string
  instance?: string
  /** 400 검증 실패에서만 온다 — { 요청 바디 필드명: 메시지 } */
  errors?: Record<string, string>
}

/**
 * 화면에 띄울 에러 메시지를 뽑아낸다.
 *
 * 401만 응답 본문이 비어 있고(Content-Length: 0), 나머지는 ProblemDetail JSON이다.
 * 그래서 본문을 먼저 뒤지지 않고 상태코드부터 본다 — 빈 본문에서 detail을 읽으면 undefined로 샌다.
 */
export function getErrorMessage(
  error: unknown,
  fallback = '잠시 후 다시 시도해주세요.',
) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return '로그인이 필요해요. 다시 로그인해주세요.'
    }
    const data = error.response?.data as ProblemDetail | undefined
    // axios의 error.message는 "Request failed with status code 409" 같은 영문이라
    // 사용자에게 보여줄 수 없다. 서버 문장이 없으면 fallback으로 간다.
    return data?.detail ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

/**
 * 400 검증 실패의 필드별 메시지 (2026-08-24 백엔드 변경).
 * 입력란 아래에 문구를 붙일 때 쓴다. 400이 아니거나 필드 조합 오류면 비어 있다.
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {}
  const data = error.response?.data as ProblemDetail | undefined
  return data?.errors ?? {}
}
