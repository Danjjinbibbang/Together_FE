import { useNavigate, useParams } from 'react-router-dom'

import { DayDivider, FeedItem } from '@/components/domain/FeedItem'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { EmptyState } from '@/components/ui/Feedback'
import { useChallenge } from '@/hooks/useChallenges'
import { useMissionLogs } from '@/hooks/useMissionLogs'
import { ROUTES } from '@/routes/paths'
import type { MissionLogListItem } from '@/types/api'

/** assignedDate 기준으로 묶는다 — 목록은 날짜 내림차순으로 온다고 가정 */
function groupByDate(logs: MissionLogListItem[]) {
  const groups = new Map<string, MissionLogListItem[]>()
  for (const log of logs) {
    const bucket = groups.get(log.assignedDate) ?? []
    bucket.push(log)
    groups.set(log.assignedDate, bucket)
  }
  return [...groups.entries()]
}

/** "2026-08-19" → "8월 19일" (오늘·어제는 따로 표시) */
function formatDayLabel(isoDate: string) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate

  const today = new Date()
  const dayDiff = Math.round(
    (new Date(today.toDateString()).getTime() -
      new Date(date.toDateString()).getTime()) /
      86_400_000,
  )
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일`
  if (dayDiff === 0) return `오늘 · ${label}`
  if (dayDiff === 1) return `어제 · ${label}`
  return label
}

/** 26. 팀 활동 피드 (FR-039) */
export function TeamFeedPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const challengeQuery = useChallenge(challengeId)
  // 파라미터 없이 부르면 팀원 전원의 기록이 온다
  const logsQuery = useMissionLogs(challengeId)
  const myMemberId = challengeQuery.data?.myMemberId

  return (
    <MobileFrame>
      <TopBar
        title={`${challengeQuery.data?.title ?? '챌린지'} · 활동 피드`}
        showBack
      />

      <PageContent className="pb-8">
        <AsyncBoundary
          query={logsQuery}
          empty={
            <EmptyState className="mt-6">
              아직 팀 활동이 없어요.
              <br />첫 미션을 수행해보세요.
            </EmptyState>
          }
        >
          {(logs) =>
            groupByDate(logs).map(([date, entries]) => (
              <section key={date} className="mb-2">
                <DayDivider>{formatDayLabel(date)}</DayDivider>
                {entries.map((log) => (
                  <FeedItem
                    key={log.missionLogId}
                    log={log}
                    isMe={log.memberId === myMemberId}
                    onClick={() =>
                      navigate(ROUTES.missionLog(String(log.missionLogId)))
                    }
                  />
                ))}
              </section>
            ))
          }
        </AsyncBoundary>
      </PageContent>
    </MobileFrame>
  )
}
