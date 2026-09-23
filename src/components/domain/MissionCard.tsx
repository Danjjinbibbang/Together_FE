import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatWonRange } from '@/lib/format'

/** 카드뽑기 화면의 미션 카드 (화면 10) */
export function MissionDrawCard({
  emoji,
  title,
  rewardMin,
  rewardMax,
}: {
  emoji: string
  title: string
  /** 예: "100~2,000원" */
  /** 보상 범위. 실제 금액은 제출 후 이 안에서 랜덤으로 정해진다 (FR-013) */
  rewardMin: number
  rewardMax: number
}) {
  return (
    <div className="bg-surface relative mx-auto mb-7 flex h-75 w-55 flex-col items-center justify-center rounded-3xl px-5 text-center shadow-[0_20px_40px_rgba(0,0,0,.25)]">
      <Badge
        tone="accent"
        outline
        className="absolute top-4 right-4 text-[10px]"
      >
        TODAY
      </Badge>
      <div className="mb-4.5 text-5xl" aria-hidden>
        {emoji}
      </div>
      <p className="text-ink text-base leading-relaxed font-extrabold">
        {title}
      </p>
      <Badge tone="accent" size="lg" className="mt-4">
        🪙 {formatWonRange(rewardMin, rewardMax)}
      </Badge>
    </div>
  )
}

/** 미션 작성 화면 상단의 오늘의 미션 배너 (화면 11) */
export function TodayMissionBanner({ title }: { title: string }) {
  return (
    <Card variant="primary" padding="md" radius="md" className="mb-5">
      <p className="mb-1 text-[11px] opacity-80">오늘의 미션</p>
      <p className="text-[15px] font-extrabold">{title}</p>
    </Card>
  )
}

interface ModeCardProps {
  emoji: string
  name: string
  description: string
  selected: boolean
  onSelect: () => void
  /** 선택됐을 때 카드 하단에 붙는 이동 링크 (미션 관리로 이동) */
  action?: { label: string; onClick: () => void }
}

/** 미션 운영 방식 선택 카드 (화면 09) */
export function ModeCard({
  emoji,
  name,
  description,
  selected,
  onSelect,
  action,
}: ModeCardProps) {
  return (
    <div
      className={cn(
        'bg-surface mb-3.5 rounded-[20px] border-2 p-[18px]',
        selected ? 'border-primary bg-[#F2F8F5]' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full text-left"
      >
        <span className="mb-2 flex items-center gap-2.5">
          <span className="text-[22px]" aria-hidden>
            {emoji}
          </span>
          <span className="text-ink text-[15px] font-extrabold">{name}</span>
        </span>
        <span className="text-muted block text-[12.5px] leading-relaxed">
          {description}
        </span>
      </button>

      {selected && action && (
        <button
          type="button"
          onClick={action.onClick}
          className="bg-primary mt-3.5 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-[13px] font-bold text-white"
        >
          <span>{action.label}</span>
          <span aria-hidden>›</span>
        </button>
      )}
    </div>
  )
}
