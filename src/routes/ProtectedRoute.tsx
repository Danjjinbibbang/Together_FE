import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'

/**
 * 로그인이 필요한 화면을 감싸는 가드.
 * 토큰 확인이 끝나기 전에 리다이렉트하면 새로고침할 때마다 로그인 화면이 번쩍이므로,
 * hydrate가 끝나는(status !== 'loading') 시점까지 기다린다.
 */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        불러오는 중…
      </div>
    )
  }

  if (status === 'unauthenticated') {
    // 로그인 후 원래 가려던 곳으로 돌려보내기 위해 위치를 남긴다.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
