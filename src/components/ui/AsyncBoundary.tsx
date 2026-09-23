import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { getErrorMessage } from '@/api/client'

interface AsyncBoundaryProps<T> {
  /** useQuery가 돌려준 값 그대로 넘긴다 */
  query: {
    data: T | undefined
    isPending: boolean
    isError: boolean
    error: unknown
    refetch: () => void
  }
  /** 데이터가 비었을 때 보여줄 내용 (배열이면 길이 0으로 판단) */
  empty?: ReactNode
  children: (data: T) => ReactNode
}

/**
 * 조회 상태(로딩·에러·빈 값)를 한 곳에서 처리한다.
 *
 * 화면마다 isPending/isError 분기를 반복해 쓰면 처리를 빠뜨리기 쉬워서,
 * 데이터가 실제로 있을 때만 children이 호출되도록 감싼다.
 */
export function AsyncBoundary<T>({
  query,
  empty,
  children,
}: AsyncBoundaryProps<T>) {
  if (query.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (query.isError || query.data === undefined) {
    return (
      <EmptyState
        className="mt-6"
        action={
          <Button variant="ghost" size="sm" onClick={() => query.refetch()}>
            다시 시도
          </Button>
        }
      >
        {getErrorMessage(query.error, '정보를 불러오지 못했어요.')}
      </EmptyState>
    )
  }

  if (empty && Array.isArray(query.data) && query.data.length === 0) {
    return <>{empty}</>
  }

  return <>{children(query.data)}</>
}
