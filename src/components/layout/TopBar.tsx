import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/cn'

interface TopBarProps {
  title?: ReactNode
  /**
   * 뒤로가기 버튼 표시 여부.
   * 상단바 규칙: 최상위 화면(홈/챌린지 목록/마이)은 좌측을 비운다.
   */
  showBack?: boolean
  /** 미지정 시 history.back() */
  onBack?: () => void
  /** 우측 액션 (알림 벨, ⋮ 메뉴, + 버튼 등) */
  right?: ReactNode
  /** 파란 배경 위에 올릴 때 흰색으로 반전 */
  tone?: 'default' | 'onBrand'
  className?: string
}

/**
 * 화면 상단바.
 *
 * 제목은 absolute로 가운데 정렬한다 — 좌우 버튼 유무와 관계없이 항상 화면 정중앙에
 * 오도록 하기 위함이며, 와이어프레임의 `left:56px; right:56px` 규칙을 그대로 옮긴 것이다.
 */
export function TopBar({
  title,
  showBack = false,
  onBack,
  right,
  tone = 'default',
  className,
}: TopBarProps) {
  const navigate = useNavigate()
  const onBrand = tone === 'onBrand'

  return (
    <div
      className={cn(
        'safe-top relative flex shrink-0 items-center gap-3 px-5 pt-7 pb-4',
        className,
      )}
    >
      {showBack ? (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className={cn(
            'flex size-8 items-center justify-center rounded-full text-lg',
            onBrand
              ? 'bg-white/20 text-white'
              : 'border-border bg-surface text-ink border',
          )}
        >
          ‹
        </button>
      ) : (
        // 제목이 absolute라 좌우 버튼이 모두 없으면 행 높이가 0으로 무너진다.
        // 버튼과 같은 크기의 빈 자리로 바 높이를 항상 확보한다.
        <span className="size-8 shrink-0" aria-hidden />
      )}

      {title && (
        <h1
          className={cn(
            'pointer-events-none absolute inset-x-14 truncate text-center text-base font-bold',
            onBrand ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </h1>
      )}

      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

/**
 * 상단바 우측에 놓는 아이콘 버튼 (벨, ⋮, +).
 * dot을 켜면 우상단에 안 읽음 표시가 붙는다.
 */
export function TopBarAction({
  label,
  icon,
  onClick,
  dot = false,
  variant = 'surface',
}: {
  label: string
  icon: ReactNode
  onClick?: () => void
  dot?: boolean
  variant?: 'surface' | 'primary'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-xl text-base',
        variant === 'primary'
          ? 'bg-primary size-8.5 text-lg font-bold text-white'
          : 'border-border bg-surface size-9 border',
      )}
    >
      {icon}
      {dot && (
        <span className="bg-danger absolute top-1.5 right-1.5 size-2 rounded-full" />
      )}
    </button>
  )
}

/**
 * 상단바 없이 작은 회색 라벨만 두는 화면용 헤더 (화면 06·12·17·20).
 */
export function PageHeader({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'onBrand'
  className?: string
}) {
  return (
    <p
      className={cn(
        'safe-top shrink-0 px-5 pt-7 text-center text-xs font-bold tracking-wide',
        tone === 'onBrand' ? 'text-white/75' : 'text-muted',
        className,
      )}
    >
      {children}
    </p>
  )
}
