import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SelectableRow } from '@/components/ui/Choice'
import { Toast } from '@/components/ui/Feedback'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { getErrorMessage } from '@/api/client'
import { useChallenge, useTransferOwner } from '@/hooks/useChallenges'
import { useMembers } from '@/hooks/useMembers'
import { formatWon } from '@/lib/format'
import { ROUTES } from '@/routes/paths'
import type { ID } from '@/types/api'

/**
 * 22. 방장 양도 (FR-037).
 *
 * 후보마다 챌린지별 연속 성공일(FR-025①)을 함께 보여준다 —
 * 2026-08-25에 멤버 목록 응답에 streak이 추가되면서 와이어프레임대로 복원했다.
 */
export function OwnerTransferPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)

  const challengeQuery = useChallenge(challengeId)
  const membersQuery = useMembers(challengeId)
  const transferOwner = useTransferOwner(challengeId)

  const [selectedId, setSelectedId] = useState<ID | null>(null)

  const members = membersQuery.data ?? []
  const owner = members.find((member) => member.role === 'OWNER')
  const candidates = members.filter((member) => member.role !== 'OWNER')
  const selected = candidates.find((member) => member.memberId === selectedId)

  return (
    <MobileFrame>
      <TopBar
        title={`${challengeQuery.data?.title ?? '챌린지'} · 방장 양도`}
        showBack
      />

      <PageContent>
        <div className="border-danger/30 bg-danger-tint mb-6 flex gap-3 rounded-2xl border p-4">
          <span className="text-lg" aria-hidden>
            ⚠️
          </span>
          <p className="text-xs leading-relaxed text-[#8A2F2F]">
            방장 권한을 넘기면 챌린지 정보 수정, 미션 관리 권한이 모두 새
            방장에게 넘어가요. 되돌리려면 새 방장이 다시 양도해야 해요.
          </p>
        </div>

        <SectionLabel>새 방장을 선택하세요</SectionLabel>

        <AsyncBoundary query={membersQuery}>
          {() => (
            <>
              {owner && (
                <SelectableRow
                  control="radio"
                  selected={false}
                  disabled
                  onSelect={() => {}}
                >
                  <span className="flex items-center gap-3">
                    <Avatar name={owner.nickname} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="text-ink truncate text-[13px] font-bold">
                          {owner.nickname}
                        </span>
                        <Badge tone="accentSolid" size="sm">
                          현재 방장
                        </Badge>
                      </span>
                      <span className="text-muted mt-0.5 block text-[11.5px]">
                        잔액 {formatWon(owner.balance)} · {owner.streak}일 연속
                        🔥
                      </span>
                    </span>
                  </span>
                </SelectableRow>
              )}

              {candidates.map((member) => (
                <SelectableRow
                  key={member.memberId}
                  control="radio"
                  selected={selectedId === member.memberId}
                  onSelect={() => setSelectedId(member.memberId)}
                >
                  <span className="flex items-center gap-3">
                    <Avatar name={member.nickname} />
                    <span className="min-w-0">
                      <span className="text-ink block truncate text-[13px] font-bold">
                        {member.nickname}
                      </span>
                      <span className="text-muted mt-0.5 block text-[11.5px]">
                        잔액 {formatWon(member.balance)} · {member.streak}일
                        연속 🔥
                      </span>
                    </span>
                  </span>
                </SelectableRow>
              ))}
            </>
          )}
        </AsyncBoundary>

        {transferOwner.isError && (
          <Toast tone="error" className="mt-4">
            ⚠ {getErrorMessage(transferOwner.error, '양도하지 못했어요.')}
          </Toast>
        )}
      </PageContent>

      <PageFooter>
        <Button
          disabled={!selected || transferOwner.isPending}
          onClick={() =>
            selected &&
            transferOwner.mutate(
              { newOwnerMemberId: selected.memberId },
              {
                onSuccess: () =>
                  navigate(ROUTES.challenge(String(challengeId)), {
                    replace: true,
                  }),
              },
            )
          }
        >
          {selected
            ? `${selected.nickname}님에게 양도하기`
            : '양도할 멤버를 선택하세요'}
        </Button>
        <p className="text-muted mt-2.5 text-center text-[11.5px]">
          양도 후에는 취소할 수 없어요
        </p>
      </PageFooter>
    </MobileFrame>
  )
}
