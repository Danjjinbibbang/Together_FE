import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { PageHeader } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Button } from '@/components/ui/Button'
import { useInviteCode } from '@/hooks/useChallenges'
import { ROUTES } from '@/routes/paths'

/** 06. 챌린지 생성 완료 / 초대코드 공유 (FR-002) */
export function InviteSharePage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const inviteQuery = useInviteCode(challengeId)
  const [copied, setCopied] = useState(false)

  /** 코드만 복사하면 받는 쪽이 앱을 열고 코드를 찾아 쳐야 해서 링크째로 준다 */
  const copyInviteUrl = async (inviteUrl: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다 — 코드가 화면에 떠 있어 직접 옮겨 적을 수 있다
    }
  }

  return (
    <MobileFrame>
      <PageHeader>초대코드 공유</PageHeader>

      <PageContent className="px-6 pt-10 text-center">
        <div className="bg-primary mx-auto mb-5 flex size-18 items-center justify-center rounded-full text-3xl text-white">
          ✓
        </div>
        <h1 className="text-ink mb-2 text-xl font-extrabold">
          챌린지가 만들어졌어요!
        </h1>
        <p className="text-muted mb-8 text-[13px]">
          아래 코드로 친구들을 초대해보세요
        </p>

        <AsyncBoundary query={inviteQuery}>
          {(invite) => (
            <>
              <div className="border-primary bg-surface mb-4 rounded-[18px] border-[1.5px] border-dashed p-5.5">
                <p className="text-muted mb-2 text-xs">초대코드</p>
                <p className="text-primary-dark text-[28px] font-extrabold tracking-[4px]">
                  {invite.inviteCode}
                </p>
              </div>

              <div className="flex gap-2.5">
                {/*
                  TODO: 카카오톡 공유는 Kakao SDK(Share)가 필요해 아직 붙이지 않았다.
                    링크 복사로도 초대는 되므로 MVP를 막지는 않는다.
                */}
                <Button variant="ghost" size="md" className="flex-1" disabled>
                  💬 카카오톡
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  onClick={() => void copyInviteUrl(invite.inviteUrl)}
                >
                  {copied ? '✓ 복사됨' : '🔗 링크 복사'}
                </Button>
              </div>
            </>
          )}
        </AsyncBoundary>
      </PageContent>

      <div className="safe-bottom px-6 pb-7">
        <Button
          variant="accent"
          onClick={() =>
            navigate(ROUTES.challenge(challengeIdParam), { replace: true })
          }
        >
          그룹 홈으로 이동
        </Button>
      </div>
    </MobileFrame>
  )
}
