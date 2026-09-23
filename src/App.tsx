import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'

import { registerUnauthorizedHandler } from '@/api/client'
import { queryClient } from '@/api/queryClient'
import { router } from '@/routes/router'
import { useAuthStore } from '@/store/authStore'

// axios 인터셉터가 401을 만났을 때의 동작을 앱 부팅 시 한 번만 연결한다.
// 라우터는 모듈 싱글턴이라 React 밖에서도 navigate를 쓸 수 있다.
registerUnauthorizedHandler(() => {
  useAuthStore.setState({ status: 'unauthenticated' })
  queryClient.clear()
  void router.navigate('/login', { replace: true })
})

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
