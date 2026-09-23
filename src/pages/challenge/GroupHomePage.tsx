import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { MemberRow } from '@/components/domain/MemberRow'
import { TeamCheerBox } from '@/components/domain/TeamCheerBox'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar, TopBarAction } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Card } from '@/components/ui/Card'
import { Dropdown } from '@/components/ui/Dropdown'
import { AlertDialog } from '@/components/ui/Feedback'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useChallenge } from '@/hooks/useChallenges'
import { useGoalProgress } from '@/hooks/useGoalProgress'
import { useLeaveChallenge, useMembers } from '@/hooks/useMembers'
import { useHasActiveMission } from '@/hooks/useMissions'
import { cn } from '@/lib/cn'
import { formatWon } from '@/lib/format'
import { ROUTES } from '@/routes/paths'

/** 그룹 홈에서 다른 화면으로 넘어가는 큰 배너형 링크 */
function NavBanner({
  tone,
  children,
  onClick,
  disabled = false,
  hint,
}: {
  tone: 'accent' | 'surface'
  children: string
  onClick: () => void
  disabled?: boolean
  /** 비활성일 때 아래에 붙는 안내 문구 */
  hint?: string
}) {
  return (
    <div className={tone === 'accent' ? 'mb-2.5' : 'mb-5'}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-[14px] px-4 py-3.5 text-[13px]',
          tone === 'accent'
            ? 'bg-accent text-accent-ink-strong font-extrabold'
            : 'border-border bg-surface text-ink border font-bold',
          disabled && 'cursor-not-allowed opacity-45',
        )}
      >
        <span>{children}</span>
        <span aria-hidden>›</span>
      </button>
      {disabled && hint && (
        <p className="text-muted mt-2 px-1 text-[11.5px]">{hint}</p>
      )}
    </div>
  )
}

/** 08. 그룹 홈 (FR-005, FR-036~039) */
export function GroupHomePage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const [menuOpen, setMenuOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)

  const challengeQuery = useChallenge(challengeId)
  const membersQuery = useMembers(challengeId)
  const { data: hasActiveMission = true } = useHasActiveMission(challengeId)
  const leaveMutation = useLeaveChallenge(challengeId)

  /*
    개인 달성과 팀 달성을 따로 본다 (FR-045).
    goalAmount는 1인당 목표라, 내가 끝나도 아직 채우는 중인 팀원이 있다.
    그래서 화면을 닫지 않고 응원(리액션·댓글)으로 방향만 돌린다.
  */
  const progress = useGoalProgress(challengeId)

  const isOwner = challengeQuery.data?.myRole === 'OWNER'
  /**
   * 방장은 양도하기 전에는 탈퇴할 수 없다 — 서버가 409로 막는다.
   * 방장 없는 챌린지가 되면 미션 관리와 재판정이 전부 멈추기 때문이다.
   */
  const leaveBlocked = isOwner

  return (
    <MobileFrame>
      <TopBar
        title={challengeQuery.data?.title ?? '챌린지'}
        showBack
        right={
          <TopBarAction
            label="챌린지 메뉴"
            icon="⋮"
            onClick={() => setMenuOpen(true)}
          />
        }
      />

      <Dropdown
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          ...(isOwner
            ? ([
                {
                  icon: '✏️',
                  label: '정보 수정',
                  onClick: () => navigate(`/challenges/${challengeId}/edit`),
                },
                {
                  icon: '👑',
                  label: '방장 양도',
                  onClick: () =>
                    navigate(`/challenges/${challengeId}/owner-transfer`),
                },
                {
                  icon: '⚙️',
                  label: '미션 운영 설정',
                  onClick: () =>
                    navigate(ROUTES.missionMode(String(challengeId))),
                },
              ] as const)
            : []),
          {
            icon: '🔗',
            label: '초대코드 조회',
            onClick: () =>
              navigate(ROUTES.challengeInvite(String(challengeId))),
          },
          {
            icon: '🚪',
            label: '챌린지 탈퇴',
            tone: 'danger' as const,
            onClick: () => setLeaveOpen(true),
          },
        ]}
      />

      <PageContent className="pb-8">
        <AsyncBoundary query={challengeQuery}>
          {(challenge) => (
            <Card variant="primary" padding="xl" className="mb-5">
              <p className="mb-1.5 text-[13px] opacity-85">팀 전체 진행률</p>
              <p className="mb-3.5 text-[26px] font-extrabold">
                {challenge.totalBalance.toLocaleString('ko-KR')}원 /{' '}
                {formatWon(progress.teamGoalAmount ?? challenge.goalAmount)}
              </p>
              {/*
                ⚠️ 서버의 progressRate를 쓰지 않는다.
                현재 수식이 totalBalance ÷ goalAmount라, 1인당 목표 기준에서는
                4명이 각자 1/4씩만 모아도 100%로 나온다. 수식이 정정되면
                progress.teamProgressRate 자리에 challenge.progressRate를 되돌리면 된다.
              */}
              <ProgressBar
                tone="onPrimary"
                size="md"
                value={progress.teamProgressRate ?? 0}
              />
              {progress.isLoaded && (
                <p className="mt-2 text-[11.5px] opacity-85">
                  팀원 {progress.memberCount}명 중 {progress.achievedCount}명이
                  목표를 채웠어요
                </p>
              )}
            </Card>
          )}
        </AsyncBoundary>

        {/*
          팀 달성 축하는 여기에 두지 않는다.
          축하는 "달성한 순간의 연출"이라 상시 배너로 걸어두면 성격이 달라진다.
          전달은 TEAM_GOAL_ACHIEVED 알림이 맡고, 알림함(15)에서 눌러 축하 화면으로 들어간다.

          달성자에게는 뽑기 자리를 응원 안내로 바꾼다 — 누를 수 없는 버튼을 남겨두지 않는다.
          미달성자에게는 뽑기 배너를 그리되, 활성 미션이 0개면 비활성으로 둔다
          (생성 플로우에서 최소 1개를 강제하지만 방장이 나중에 전부 끌 수 있다).
        */}
        {progress.isMineAchieved ? (
          <div className="border-accent bg-accent/12 mb-5 rounded-[14px] border px-4 py-3.5">
            <p className="text-ink text-[13px] font-extrabold">
              🏆 목표를 다 모았어요!
            </p>
            <p className="text-muted mt-1.5 text-[11.5px] leading-relaxed">
              내 미션은 여기까지예요. 아래에서 응원을 보내거나, 팀원의 기록에
              리액션과 댓글을 남겨보세요.
            </p>
          </div>
        ) : (
          <NavBanner
            tone="accent"
            disabled={!hasActiveMission}
            hint={
              isOwner
                ? '활성화된 미션이 없어요. 미션 관리에서 미션을 추가하거나 다시 켜주세요.'
                : '아직 미션이 준비되지 않았어요. 방장이 미션을 등록하면 시작할 수 있어요.'
            }
            onClick={() =>
              hasActiveMission
                ? navigate(ROUTES.missionDraw(String(challengeId)))
                : navigate(`/challenges/${challengeId}/missions`)
            }
          >
            🎴 오늘의 미션 뽑기
          </NavBanner>
        )}

        <NavBanner
          tone="surface"
          onClick={() => navigate(`/challenges/${challengeId}/feed`)}
        >
          📰 팀 활동 피드 보기
        </NavBanner>

        {/* 목표를 먼저 채운 사람이 아직 모으는 중인 팀원을 응원하는 자리 (FR-044) */}
        <TeamCheerBox challengeId={challengeId} />

        <SectionLabel tone="muted">멤버별 계좌</SectionLabel>
        <AsyncBoundary query={membersQuery}>
          {(members) =>
            members.map((member) => (
              <MemberRow
                key={member.memberId}
                member={member}
                onClick={() =>
                  navigate(
                    ROUTES.account(
                      String(challengeId),
                      member.memberId === challengeQuery.data?.myMemberId
                        ? 'me'
                        : String(member.memberId),
                    ),
                  )
                }
              />
            ))
          }
        </AsyncBoundary>
      </PageContent>

      {leaveOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0F1720]/50 px-6">
          {leaveBlocked ? (
            <AlertDialog
              icon="👑"
              title="먼저 방장을 양도해주세요"
              description="방장은 바로 탈퇴할 수 없어요. 방장이 없으면 미션 관리와 재판정이 멈추기 때문이에요."
              cancelText="닫기"
              confirmText="방장 양도하기"
              className="w-full"
              onCancel={() => setLeaveOpen(false)}
              onConfirm={() => {
                setLeaveOpen(false)
                navigate(`/challenges/${challengeId}/owner-transfer`)
              }}
            />
          ) : (
            <AlertDialog
              icon="🚪"
              title="챌린지를 탈퇴할까요?"
              description="탈퇴하면 이 챌린지의 미션 기록과 알림을 더 이상 받을 수 없어요."
              confirmText="탈퇴하기"
              destructive
              className="w-full"
              onCancel={() => setLeaveOpen(false)}
              onConfirm={() =>
                leaveMutation.mutate(undefined, {
                  onSuccess: () => navigate(ROUTES.home, { replace: true }),
                })
              }
            />
          )}
        </div>
      )}
    </MobileFrame>
  )
}
