import { useEffect, useState } from 'react'

/**
 * 소프트 키보드가 가린 높이(px)를 돌려준다. 하단 고정 요소를 그만큼 밀어 올리는 데 쓴다.
 *
 * 플랫폼 분기가 필요 없는 이유:
 * visualViewport는 "실제로 보이는 영역"을 알려주는 표준 API라 모바일 브라우저와
 * Capacitor WebView(iOS WKWebView / Android WebView) 모두에서 동작한다.
 *
 * Capacitor에서 keyboard resize 모드가 켜져 WebView 자체가 이미 줄어든 경우에는
 * window.innerHeight도 함께 줄어들어 값이 0이 된다 — 이중으로 밀어 올리지 않고
 * 알아서 맞춰지므로, 이 훅 하나로 두 상황을 다 덮는다.
 *
 * 데스크톱 브라우저에서는 키보드가 없으니 항상 0이다.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const update = () => {
      // 레이아웃 뷰포트에서 보이는 영역을 뺀 나머지 = 키보드가 차지한 높이
      const hidden = window.innerHeight - viewport.height - viewport.offsetTop
      setInset(Math.max(0, Math.round(hidden)))
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)

    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
