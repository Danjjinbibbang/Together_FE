import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ChallengeCard } from '@/components/domain/ChallengeCard'
import { BottomTab, Fab } from '@/components/layout/BottomTab'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar, TopBarAction } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { BottomSheet, SheetOption } from '@/components/ui/BottomSheet'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Feedback'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useChallenges } from '@/hooks/useChallenges'
import { useUnreadCount } from '@/hooks/useNotifications'
import { formatWon } from '@/lib/format'
import { ROUTES } from '@/routes/paths'

/**
 * 03. 홈 대시보드 (+ 03b FAB 바텀시트).
 * ver3에서 하단 탭의 "챌린지" 항목이 제거되고 홈이 챌린지 목록을 겸한다.
 */
export function HomePage() {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const challengesQuery = useChallenges()
  const { data: unreadCount = 0 } = useUnreadCount()

  // 홈 히어로의 합산 잔액은 모든 챌린지 잔액의 합이다 (전용 API가 없다)
  const totalBalance = (challengesQuery.data ?? []).reduce(
    (sum, challenge) => sum + challenge.currentBalance,
    0,
  )

  return (
    <MobileFrame>
      <TopBar
        title="내 챌린지"
        right={
          <TopBarAction
            label={`알림함${unreadCount > 0 ? ` (안 읽음 ${unreadCount}개)` : ''}`}
            icon="🔔"
            dot={unreadCount > 0}
            onClick={() => navigate(ROUTES.notifications)}
          />
        }
      />

      <PageContent className="pb-6">
        <Card variant="hero" padding="xl" radius="xl" className="mb-5.5">
          <p className="mb-1.5 text-xs opacity-85">모든 챌린지 합산 잔액</p>
          <p className="text-[26px] font-extrabold">
            {formatWon(totalBalance)}
          </p>
        </Card>

        <SectionLabel trailing={`${challengesQuery.data?.length ?? 0}개`}>
          내 챌린지
        </SectionLabel>

        <AsyncBoundary
          query={challengesQuery}
          empty={
            <EmptyState>
              아직 참여 중인 챌린지가 없어요.
              <br />
              아래 + 버튼으로 시작해보세요.
            </EmptyState>
          }
        >
          {(challenges) =>
            challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.challengeId}
                challenge={challenge}
                onClick={() =>
                  navigate(ROUTES.challenge(String(challenge.challengeId)))
                }
              />
            ))
          }
        </AsyncBoundary>
      </PageContent>

      <Fab label="챌린지 추가" onClick={() => setSheetOpen(true)} />
      <BottomTab />

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="어떻게 시작할까요?"
      >
        <SheetOption
          icon="✨"
          tone="primary"
          title="새 챌린지 만들기"
          description="목표를 정하고 친구들을 초대해보세요"
          onClick={() => navigate(ROUTES.challengeCreate)}
        />
        <SheetOption
          icon="🔑"
          tone="accent"
          title="초대코드로 참여하기"
          description="친구에게 받은 코드를 입력하세요"
          onClick={() => navigate(ROUTES.challengeJoin)}
        />
      </BottomSheet>
    </MobileFrame>
  )
}
