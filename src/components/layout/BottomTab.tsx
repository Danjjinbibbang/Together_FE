import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { ROUTES } from '@/routes/paths'

/**
 * 하단 탭. 상단바 규칙상 알림(벨)은 상단바 우측에 있으므로 탭에는 넣지 않는다.
 */
const TABS = [
  { to: ROUTES.home, icon: '🏠', label: '홈' },
  { to: ROUTES.myCalendar, icon: '📅', label: '내기록' },
  { to: ROUTES.myPage, icon: '👤', label: '마이' },
] as const

export function BottomTab() {
  return (
    <nav className="safe-bottom border-border bg-surface flex shrink-0 border-t pb-4">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px]',
              isActive ? 'text-primary font-bold' : 'text-muted',
            )
          }
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

/** 우하단 떠 있는 액션 버튼 (홈의 챌린지 추가) */
export function Fab({
  onClick,
  label,
  children = '+',
}: {
  onClick?: () => void
  label: string
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bg-accent text-accent-ink-strong absolute right-5 bottom-24 z-10 flex size-14.5 items-center justify-center rounded-full text-3xl font-bold shadow-[0_12px_24px_rgba(255,190,15,.45)]"
    >
      {children}
    </button>
  )
}
