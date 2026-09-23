import { Outlet } from 'react-router-dom'

/**
 * 모바일 WebView 기준 레이아웃 셸.
 * 데스크톱 브라우저에서 개발할 때도 실제 앱 폭으로 보이도록 max-width를 잡아둔다.
 */
export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-white shadow-sm">
      <main className="safe-area-top safe-area-bottom flex-1">
        <Outlet />
      </main>
    </div>
  )
}
