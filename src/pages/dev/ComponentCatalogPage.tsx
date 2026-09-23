import { ReviewerTag, StatusStamp } from '@/components/domain/StatusStamp'
import type { MissionLogStatus } from '@/types/api'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AlertDialog, Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { SectionLabel } from '@/components/ui/SectionLabel'

const ALL_STATUSES: MissionLogStatus[] = [
  'SUBMITTED',
  'AI_APPROVED',
  'AI_REJECTED',
  'DISPUTE_REQUESTED',
  'RECHECK_REQUESTED',
  'RESUBMITTED',
  'OWNER_APPROVED',
  'OWNER_REJECTED',
]

/**
 * 18 + 12·14 뱃지 시스템 — 화면이 아니라 공통 컴포넌트 카탈로그다.
 * 디자인 확인용이므로 /dev 경로에 둔다.
 */
export function ComponentCatalogPage() {
  return (
    <MobileFrame>
      <TopBar title="공통 컴포넌트" showBack />

      <PageContent className="pb-8">
        <SectionLabel tone="muted">승인 상태 뱃지 (8단계)</SectionLabel>
        <div className="mb-6 flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => (
            <StatusStamp key={status} status={status} />
          ))}
        </div>

        <SectionLabel tone="muted">판정 주체</SectionLabel>
        <div className="mb-6 flex flex-wrap gap-2">
          <ReviewerTag reviewer="AI" reason="LOW_QUALITY" />
          <ReviewerTag reviewer="OWNER" />
          <ReviewerTag reviewer="AUTO" />
        </div>

        <SectionLabel tone="muted">이의제기 카드 예시</SectionLabel>
        <Card className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-ink text-sm font-extrabold">
              오늘의 운동 인증샷 남기기
            </p>
            <StatusStamp status="DISPUTE_REQUESTED" />
          </div>
          <ReviewerTag reviewer="AI" reason="LOW_QUALITY" />
          <p className="text-ink my-3.5 text-[13px] leading-relaxed">
            AI가 사진 화질 문제로 미션과의 연관성을 확인하지 못했어요. 그대로
            재검토를 요청하거나, 사진을 다시 찍어 제출할 수 있어요.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="md" className="flex-1">
              그대로 재검토 요청
            </Button>
            <Button size="md" className="flex-1">
              수정 후 재제출
            </Button>
          </div>
        </Card>

        <SectionLabel tone="muted">토스트</SectionLabel>
        <div className="mb-6 space-y-3">
          <Toast tone="success">✓ 미션이 성공적으로 제출됐어요</Toast>
          <Toast tone="error">⚠ 네트워크 연결을 확인해주세요</Toast>
          <Toast>알림이 도착했어요</Toast>
        </div>

        <SectionLabel tone="muted">확인 얼럿</SectionLabel>
        <AlertDialog
          className="mb-6"
          icon="🚪"
          title="챌린지를 탈퇴할까요?"
          description="탈퇴하면 이 챌린지의 미션 기록과 알림을 더 이상 받을 수 없어요."
          confirmText="탈퇴하기"
          destructive
        />

        <SectionLabel tone="muted">인라인 배너</SectionLabel>
        <NoticeBox>
          💡 오늘 하루가 얼마 남지 않았어요! 미션을 아직 안 하셨다면 지금
          도전해보세요.
        </NoticeBox>
      </PageContent>
    </MobileFrame>
  )
}
