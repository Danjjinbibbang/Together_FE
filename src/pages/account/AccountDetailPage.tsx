import { useParams } from 'react-router-dom'

import { TransactionRow } from '@/components/domain/TransactionRow'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useAccountSummary, useMyTransactions } from '@/hooks/useAccounts'
import { formatWon, toPercent } from '@/lib/format'

/**
 * 13 / 13b. 계좌 상세 (FR-018).
 *
 * 본인과 팀원이 보는 범위가 다르다:
 *   - 본인 → 잔액 + 입금 히스토리 전체
 *   - 팀원 → 잔액과 팀 목표 기여도까지만. **거래 내역은 보이지 않는다.**
 *
 * 팀원 내역을 막은 건 백엔드 결정(2026-08-20)이다. 항목별 내역은 시계열이라
 * 활동 공백과 REVERSAL(오탐으로 회수당한 이력)이 드러나서, 잔액 한 줄과는 민감도가 다르다.
 * 그래서 팀원 거래내역 조회 API 자체가 없다.
 *
 * 팀원 잔액은 전용 API가 없어 계좌 합산 응답의 accounts[]에서 꺼내 쓴다.
 */
export function AccountDetailPage() {
  const { challengeId: challengeIdParam = '', memberId = 'me' } = useParams()
  const challengeId = Number(challengeIdParam)
  const isMine = memberId === 'me'

  const summaryQuery = useAccountSummary(challengeId)
  const transactionsQuery = useMyTransactions(challengeId)

  const summary = summaryQuery.data
  const target = isMine
    ? undefined
    : summary?.accounts.find((account) => String(account.memberId) === memberId)
  const nickname = target?.nickname ?? ''

  return (
    <MobileFrame>
      {/* NFR-008: 상세 화면 헤더는 일반 명사가 아니라 대상의 실제 이름 */}
      <TopBar
        title={isMine ? '내 계좌' : nickname ? `${nickname}님의 계좌` : '계좌'}
        showBack
      />

      <PageContent className="pb-8">
        <AsyncBoundary query={summaryQuery}>
          {(data) => {
            const balance = isMine
              ? (data.accounts.find(
                  (account) => account.memberId === target?.memberId,
                )?.balance ?? data.totalBalance)
              : (target?.balance ?? 0)
            const percent = toPercent(balance, data.goalAmount)

            return (
              <>
                {!isMine && (
                  <div className="mb-4 flex items-center gap-2.5">
                    <Avatar name={nickname || '?'} size="sm" tone="solid" />
                    <span className="text-ink text-sm font-extrabold">
                      {nickname}님의 계좌
                    </span>
                    <Badge tone="neutral" size="sm">
                      읽기 전용
                    </Badge>
                  </div>
                )}

                <Card variant="hero" padding="xl" radius="xl" className="mb-4">
                  <p className="text-xs opacity-85">
                    {isMine ? '현재 잔액' : '모은 금액'}
                  </p>
                  <p className="my-1.5 mb-3 text-[26px] font-extrabold">
                    {formatWon(balance)}
                  </p>
                  <ProgressBar tone="onPrimary" value={percent} />
                </Card>

                {!isMine && (
                  <>
                    <SectionLabel>팀 목표 기여도</SectionLabel>
                    <Card padding="lg">
                      <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-muted text-[13px]">
                          목표 {formatWon(data.goalAmount)} 중
                        </span>
                        <b className="text-primary-dark text-lg font-extrabold">
                          {percent}%
                        </b>
                      </div>
                      <ProgressBar value={percent} />
                    </Card>

                    <NoticeBox className="mt-4">
                      💡 팀원의 계좌는 모은 금액까지만 볼 수 있어요. 어떤
                      미션으로 모았는지는 팀 활동 피드에서 확인해보세요.
                    </NoticeBox>
                  </>
                )}
              </>
            )
          }}
        </AsyncBoundary>

        {isMine && (
          <>
            <SectionLabel className="mt-5">입금 히스토리</SectionLabel>
            <AsyncBoundary
              query={transactionsQuery}
              empty={
                <EmptyState>
                  아직 입금 내역이 없어요. 미션부터 해볼까요?
                </EmptyState>
              }
            >
              {(transactions) => (
                <ul>
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.transactionId} tx={tx} />
                  ))}
                </ul>
              )}
            </AsyncBoundary>
          </>
        )}
      </PageContent>
    </MobileFrame>
  )
}
