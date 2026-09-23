import { StatusStamp } from '@/components/domain/StatusStamp'
import { formatSignedWon } from '@/lib/format'
import { DEFAULT_THEME_COLOR } from '@/lib/themeColors'
import type { MyMissionLogItem } from '@/types/api'

/**
 * 내 기록 캘린더에서 선택한 날짜의 미션 한 줄 (화면 16).
 *
 * GET /me/mission-logs 응답은 챌린지 이름과 색을 각 항목에 담아 주므로
 * 호출부가 따로 채워 넣지 않는다.
 */
export function MissionLogItem({
  log,
  onClick,
}: {
  log: MyMissionLogItem
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border bg-surface mb-2.5 flex w-full items-center gap-3 rounded-2xl border border-l-4 p-3.5 text-left"
      style={{ borderLeftColor: log.themeColor ?? DEFAULT_THEME_COLOR }}
    >
      {/*
        제출 형식(텍스트/사진)이 이 응답에 없어 형식별 아이콘 대신 공통 아이콘을 쓴다.
        FR-040이 "정보 과다 방지"를 이유로 목록을 최소한으로 유지하기로 한 결과다.
      */}
      <span
        className="bg-primary-tint flex size-9 shrink-0 items-center justify-center rounded-xl text-base"
        aria-hidden
      >
        🎯
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-muted mb-0.5 block truncate text-[11px]">
          {log.challengeTitle}
        </span>
        <span className="text-ink block truncate text-[13px] font-bold">
          {log.missionTitle}
        </span>
        <StatusStamp status={log.status} className="mt-1.5 text-[10px]" />
      </span>

      <span className="text-primary-dark shrink-0 text-[13px] font-extrabold">
        {formatSignedWon(log.rewardAmount)}
      </span>
    </button>
  )
}
