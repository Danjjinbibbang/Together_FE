import { create } from 'zustand'

import { tokenStorage } from '@/lib/tokenStorage'

/**
 * 로그인 세션 상태.
 *
 * 여기에는 "로그인이 되어 있는가"만 둔다.
 * 사용자 프로필(닉네임 등)은 서버 데이터이므로 TanStack Query(queryKeys.me)로 가져온다.
 */
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  /** 앱 부팅 시 저장소에 남아있는 토큰을 확인해 초기 상태를 정한다. */
  hydrate: () => Promise<void>
  signIn: (tokens: {
    accessToken: string
    refreshToken?: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',

  hydrate: async () => {
    const accessToken = await tokenStorage.getAccessToken()
    set({ status: accessToken ? 'authenticated' : 'unauthenticated' })
  },

  signIn: async (tokens) => {
    await tokenStorage.setTokens(tokens)
    set({ status: 'authenticated' })
  },

  signOut: async () => {
    await tokenStorage.clear()
    set({ status: 'unauthenticated' })
  },
}))
