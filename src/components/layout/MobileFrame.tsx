import { cva, type VariantProps } from 'class-variance-authority'
import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/cn'

const frame = cva(
  // h-full로 높이를 고정해야 안쪽 PageContent의 세로 스크롤이 프레임 안에서 일어난다.
  // min-h-full로 두면 내용이 길 때 프레임 자체가 늘어나 상단바가 화면 밖으로 밀려난다.
  'relative mx-auto flex h-full w-full max-w-[375px] flex-col overflow-hidden',
  {
    variants: {
      /** 화면마다 배경이 다르다 — 와이어프레임의 .frame background 대응 */
      background: {
        /** 대부분의 화면 */
        default: 'bg-bg',
        /** 로그인 · 미션 뽑기 (위→아래 파란 그라데이션) */
        brand: 'bg-gradient-to-b from-primary to-primary-dark text-white',
        /** 스플래시 (대각선 그라데이션) */
        splash: 'bg-gradient-to-br from-primary to-primary-dark text-white',
        /** 약관 동의 (단색 파랑) */
        primary: 'bg-primary text-white',
        /** 목표 달성 축하 (방사형) */
        celebrate:
          'bg-[radial-gradient(circle_at_50%_20%,#25B4FF_0%,#0E74AD_100%)] text-white',
      },
    },
    defaultVariants: { background: 'default' },
  },
)

interface MobileFrameProps extends VariantProps<typeof frame> {
  children: ReactNode
  className?: string
}

/**
 * 모든 화면의 최외곽 셸. 와이어프레임의 375×812 프레임에 대응한다.
 *
 * `relative`를 여기서 보장하기 때문에 BottomSheet·BottomTab·Fab 같은
 * absolute 요소들이 화면(뷰포트)이 아니라 이 프레임 기준으로 배치된다.
 */
export function MobileFrame({
  background,
  className,
  children,
}: MobileFrameProps) {
  return <div className={cn(frame({ background }), className)}>{children}</div>
}

/**
 * 스크롤되는 본문 영역.
 * 하단 고정 요소(탭바/CTA)에 가리지 않도록 pb를 넉넉히 주는 게 기본값이다.
 */
export function PageContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    // min-h-0이 없으면 flex 자식의 최소 높이가 내용 크기가 되어 overflow-y-auto가 무시된다.
    <div
      className={cn(
        'no-scrollbar min-h-0 flex-1 overflow-y-auto px-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * 화면 하단에 고정되는 주요 CTA 영역.
 * 스크롤 컨텐츠가 버튼 뒤로 사라질 때 자연스럽도록 위쪽에 배경 그라데이션을 깐다.
 */
export function PageFooter({
  children,
  solid = false,
  className,
  style,
}: {
  children: ReactNode
  /** true면 그라데이션 없이 단색 배경 + 상단 경계선 (화면 14 댓글 입력창) */
  solid?: boolean
  className?: string
  /** 키보드 높이만큼 밀어 올리는 등 계산된 값을 직접 넣어야 할 때 */
  style?: CSSProperties
}) {
  return (
    <div
      style={style}
      className={cn(
        'safe-bottom shrink-0 px-5 pt-4 pb-7',
        solid
          ? 'border-border bg-surface border-t'
          : 'to-bg bg-gradient-to-b from-transparent to-30%',
        className,
      )}
    >
      {children}
    </div>
  )
}
