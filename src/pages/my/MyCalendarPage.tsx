import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  CalendarGrid,
  CalendarLegend,
  StreakCard,
} from '@/components/domain/Calendar'
import { ColorPickerSheet } from '@/components/domain/ColorPickerSheet'
import { MissionLogItem } from '@/components/domain/MissionLogItem'
import { BottomTab } from '@/components/layout/BottomTab'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { useChallenges } from '@/hooks/useChallenges'
import { useUpdateMyMember } from '@/hooks/useMembers'
import { useMyCalendar, useMyMissionLogs } from '@/hooks/useMe'
import {
  daysInMonth,
  defaultSelectedDay,
  getToday,
  shiftMonth,
  weekdayLabel,
} from '@/lib/date'
import { DEFAULT_THEME_COLOR } from '@/lib/themeColors'
import { ROUTES } from '@/routes/paths'

/** 캘린더는 오늘이 속한 달을 펼친 상태로 시작한다. */
const INITIAL_CURSOR = (() => {
  const today = getToday()
  return { year: today.year, month: today.month }
})()

/** 2026, 8, 19 → "2026-08-19" (서버가 받는 형식) */
function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "2026-08-19" → 19 (그 달에 속할 때만) */
function dayInMonth(isoDate: string, year: number, month: number) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return y === year && m === month ? d : null
}

/**
 * 16. 내 기록 캘린더 (+ 16b 색상 선택 시트).
 *
 * 2026-08-25부터 전 챌린지 통합 API를 쓴다 — 예전에는 참여 챌린지 수만큼 목록을
 * 나눠 받아 프론트에서 합치고 스트릭도 직접 셌다. 지금은 서버가 합쳐서 준다.
 * 여기 스트릭은 "전체 활동 연속일"이라 제출만 해도 인정된다 (FR-025②).
 */
export function MyCalendarPage() {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState<{ year: number; month: number }>(
    INITIAL_CURSOR,
  )
  const [selectedDay, setSelectedDay] = useState<number>(() =>
    defaultSelectedDay(INITIAL_CURSOR.year, INITIAL_CURSOR.month),
  )
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(
    null,
  )
  const [draftColor, setDraftColor] = useState('')

  // 보고 있는 달만 받는다 — 달을 옮기면 그 달을 다시 받아온다
  const from = toISODate(cursor.year, cursor.month, 1)
  const to = toISODate(
    cursor.year,
    cursor.month,
    daysInMonth(cursor.year, cursor.month),
  )
  const calendarQuery = useMyCalendar(from, to)
  const dayLogsQuery = useMyMissionLogs(
    toISODate(cursor.year, cursor.month, selectedDay),
  )

  // 색상 변경은 챌린지 단위라 챌린지 목록이 필요하다 (FR-042)
  const { data: challenges = [] } = useChallenges()
  const updateMyMember = useUpdateMyMember(editingChallengeId ?? 0)
  const editing = challenges.find(
    (challenge) => challenge.challengeId === editingChallengeId,
  )

  /** 달을 옮기면 그 달의 기본 날짜(이번 달이면 오늘, 아니면 1일)를 선택한다 */
  const moveMonth = (delta: number) => {
    const next = shiftMonth(cursor.year, cursor.month, delta)
    setCursor(next)
    setSelectedDay(defaultSelectedDay(next.year, next.month))
  }

  // 활동이 없는 날은 응답에 아예 없으므로, 온 날짜만 점으로 찍으면 된다
  const marks = (calendarQuery.data?.days ?? []).flatMap((day) => {
    const dayNumber = dayInMonth(day.date, cursor.year, cursor.month)
    if (dayNumber == null) return []
    return [
      {
        day: dayNumber,
        colors: day.challenges.map(
          (challenge) => challenge.themeColor ?? DEFAULT_THEME_COLOR,
        ),
      },
    ]
  })

  const dayLogs = dayLogsQuery.data ?? []

  return (
    <MobileFrame>
      <TopBar title="내 기록" />

      <PageContent className="pb-8">
        <CalendarGrid
          year={cursor.year}
          month={cursor.month}
          marks={marks}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrevMonth={() => moveMonth(-1)}
          onNextMonth={() => moveMonth(1)}
        />

        <CalendarLegend
          items={challenges.map((challenge) => ({
            name: challenge.title,
            color: challenge.themeColor ?? DEFAULT_THEME_COLOR,
          }))}
        />

        {/* FR-042: 색상 변경은 챌린지 정보수정이 아니라 캘린더 화면에서 한다 */}
        <div className="mt-2 flex flex-wrap gap-2">
          {challenges.map((challenge) => (
            <button
              key={challenge.challengeId}
              type="button"
              onClick={() => {
                setEditingChallengeId(challenge.challengeId)
                setDraftColor(challenge.themeColor ?? DEFAULT_THEME_COLOR)
              }}
              className="border-border bg-surface text-muted rounded-full border px-3 py-1.5 text-[11px] font-semibold"
            >
              ✏️ {challenge.title} 색상
            </button>
          ))}
        </div>

        {/* 서버가 계산해준 전체 활동 연속일 — 프론트에서 다시 세지 않는다 */}
        <StreakCard days={calendarQuery.data?.totalStreak ?? 0} />

        <p className="text-ink mt-6 mb-3 text-[13px] font-extrabold">
          {cursor.month}월 {selectedDay}일 (
          {weekdayLabel(cursor.year, cursor.month, selectedDay)}) · 내가 한 미션
        </p>

        {dayLogsQuery.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : dayLogs.length === 0 ? (
          <EmptyState>이 날은 수행한 미션이 없어요</EmptyState>
        ) : (
          dayLogs.map((log) => (
            <MissionLogItem
              key={log.missionLogId}
              log={log}
              onClick={() =>
                navigate(ROUTES.missionLog(String(log.missionLogId)))
              }
            />
          ))
        )}
      </PageContent>

      <BottomTab />

      <ColorPickerSheet
        open={editing != null}
        onClose={() => setEditingChallengeId(null)}
        challengeLabel={editing?.title ?? ''}
        value={draftColor}
        onChange={setDraftColor}
        onSave={() =>
          updateMyMember.mutate(
            { themeColor: draftColor },
            {
              onSuccess: () => {
                setEditingChallengeId(null)
                // 캘린더 점 색도 함께 바뀐다
                void calendarQuery.refetch()
              },
            },
          )
        }
      />
    </MobileFrame>
  )
}
