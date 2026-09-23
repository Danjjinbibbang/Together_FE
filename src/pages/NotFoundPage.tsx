import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🐷</p>
      <h1 className="text-lg font-semibold">페이지를 찾을 수 없어요</h1>
      <Link to="/" className="text-brand-600 text-sm font-medium underline">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
