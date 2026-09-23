import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import { MobileFrame } from '@/components/layout/MobileFrame'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { useAgreeToTerms } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/routes/paths'

const TERMS = [
  { id: 'service', label: '서비스 이용약관 동의 (필수)' },
  { id: 'privacy', label: '개인정보 처리방침 동의 (필수)' },
] as const

/**
 * 서버에 기록할 약관 버전 (POST /auth/terms-agreement).
 * 명세 예시가 "1.0"이다. 약관 문구를 개정하면 이 값을 올려야 재동의를 받을 수 있다.
 *
 * ⚠️ 두 항목을 따로 보낼 수단이 없다 — 요청 바디가 termsVersion 하나뿐이라
 * 화면의 개별 체크는 UI 확인용이고 서버에는 "동의함" 한 건으로 기록된다.
 */
const TERMS_VERSION = '1.0'

/**
 * 01. 약관 동의 (FR-028).
 * v0.3부터 진입 조건이 "최초 실행"이 아니라 "카카오 인증 성공 + 신규 User"다.
 *
 * v0.4 FR-003에 따라 닉네임은 여기서 받지 않는다 — 챌린지 생성/참여 시점에 각각 입력한다.
 */
export function TermsPage() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState<string[]>([])
  const agreeToTerms = useAgreeToTerms()

  const toggle = (id: string) =>
    setAgreed((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )

  const allAgreed = agreed.length === TERMS.length

  return (
    <MobileFrame background="primary">
      <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
        <div className="bg-accent mb-6 flex size-22 items-center justify-center rounded-[26px] text-4xl">
          🐷
        </div>
        <h1 className="mb-2.5 text-2xl font-extrabold text-white">
          같이모으기
        </h1>
        <p className="text-sm leading-relaxed text-white/85">
          친구들과 함께 저축 목표를 세우고
          <br />
          매일 미션으로 가상 머니를 모아보세요
        </p>
      </div>

      <div className="safe-bottom bg-surface rounded-t-[28px] px-6 pt-7 pb-8">
        <h2 className="text-ink mb-3.5 text-base font-extrabold">
          시작하기 전에 확인해주세요
        </h2>

        <NoticeBox className="mb-4.5">
          💡 여기서 모이는 돈은 실제 화폐·계좌와 무관한 <b>가상 머니</b>예요.
          실제 송금·출금 기능은 제공하지 않아요.
        </NoticeBox>

        {TERMS.map((term) => {
          const checked = agreed.includes(term.id)

          return (
            <div
              key={term.id}
              className="border-border flex items-center gap-2.5 border-b py-3"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={term.label}
                onClick={() => toggle(term.id)}
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-extrabold',
                  checked
                    ? 'bg-primary text-white'
                    : 'border-border border-[1.5px]',
                )}
              >
                {checked && '✓'}
              </button>
              <span className="text-ink flex-1 text-[13px] font-semibold">
                {term.label}
              </span>
              <button type="button" className="text-muted text-xs">
                보기 ›
              </button>
            </div>
          )
        })}

        {agreeToTerms.isError && (
          <Toast tone="error" className="mt-4">
            ⚠ {getErrorMessage(agreeToTerms.error, '동의를 저장하지 못했어요.')}
          </Toast>
        )}

        <Button
          className="mt-5"
          disabled={!allAgreed || agreeToTerms.isPending}
          onClick={() =>
            agreeToTerms.mutate(
              { termsVersion: TERMS_VERSION },
              {
                onSuccess: () => navigate(ROUTES.home, { replace: true }),
              },
            )
          }
        >
          {agreeToTerms.isPending ? '저장 중…' : '동의하고 시작하기'}
        </Button>
      </div>
    </MobileFrame>
  )
}
