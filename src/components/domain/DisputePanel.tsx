import { useState } from 'react'

import { getErrorMessage } from '@/api/client'
import { REJECT_REASON_LABEL } from '@/lib/missionLog'
import { Button } from '@/components/ui/Button'
import { ChipGroup } from '@/components/ui/Choice'
import { TextAreaField } from '@/components/ui/Field'
import { Toast } from '@/components/ui/Feedback'
import { NoticeBox } from '@/components/ui/NoticeBox'
import {
  useAutoApproveMissionLog,
  useDisputeActions,
  useReviewMissionLog,
} from '@/hooks/useMissionLogs'
import type { MissionLogDetailResponse, RejectReasonCode } from '@/types/api'

const REJECT_REASONS = Object.entries(REJECT_REASON_LABEL).map(
  ([value, label]) => ({ value: value as RejectReasonCode, label }),
)

/**
 * AI 오탐 이의제기 흐름 (FR-012a~e, 화면 14).
 *
 * 상태에 따라 누가 무엇을 할 수 있는지가 갈린다:
 *
 *   AI_REJECTED        → 작성자: 이의제기 시작
 *   DISPUTE_REQUESTED  → 작성자: 그대로 재검토 / 수정 후 재제출  ·  방장: 재판정
 *   RECHECK_REQUESTED  → 방장: 재판정  ·  작성자: 72시간 지나면 자동 승인 요청
 *   RESUBMITTED        → 위와 같음
 *
 * 나머지 상태(SUBMITTED·승인·최종반려)에서는 아무것도 그리지 않는다.
 */
export function DisputePanel({
  log,
  isAuthor,
  isOwner,
}: {
  log: MissionLogDetailResponse
  isAuthor: boolean
  isOwner: boolean
}) {
  const { status, missionLogId, challengeId } = log

  const { dispute, recheck, resubmit } = useDisputeActions(missionLogId)
  const review = useReviewMissionLog(missionLogId, challengeId)
  const autoApprove = useAutoApproveMissionLog(missionLogId, challengeId)

  const [reason, setReason] = useState('')
  const [draft, setDraft] = useState(log.submitContent ?? '')
  const [mode, setMode] = useState<'none' | 'dispute' | 'resubmit' | 'reject'>(
    'none',
  )
  const [rejectCode, setRejectCode] = useState<RejectReasonCode>('LOW_QUALITY')

  /** 방장 판정을 기다리는 중인 상태들 */
  const isWaitingReview =
    status === 'DISPUTE_REQUESTED' ||
    status === 'RECHECK_REQUESTED' ||
    status === 'RESUBMITTED'

  if (status === 'AI_REJECTED' && isAuthor) {
    return (
      <section className="border-danger/30 bg-danger-tint mt-5 rounded-2xl border p-4">
        <p className="text-danger mb-2 text-[13px] font-extrabold">
          🤖 AI가 이 인증을 반려했어요
        </p>
        <p className="mb-3.5 text-[11.5px] leading-relaxed text-[#8A2F2F]">
          {log.rejectReasonCode
            ? `사유: ${REJECT_REASON_LABEL[log.rejectReasonCode]}. `
            : ''}
          잘못된 판정이라고 생각되면 이의제기할 수 있어요. 방장이 다시
          확인해드려요.
        </p>

        {mode === 'dispute' ? (
          <>
            <TextAreaField
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="어떤 점이 잘못 판정됐는지 알려주세요"
              wrapperClassName="mb-3"
              className="min-h-24"
            />
            <div className="flex gap-2.5">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => setMode('none')}
              >
                취소
              </Button>
              <Button
                size="md"
                className="flex-1"
                disabled={!reason.trim() || dispute.isPending}
                onClick={() =>
                  dispute.mutate(
                    { reason: reason.trim() },
                    { onSuccess: () => setMode('none') },
                  )
                }
              >
                {dispute.isPending ? '접수 중…' : '이의제기 접수'}
              </Button>
            </div>
          </>
        ) : (
          <Button
            size="md"
            className="w-full"
            onClick={() => setMode('dispute')}
          >
            🙋 이의제기하기
          </Button>
        )}

        {dispute.isError && (
          <Toast tone="error" className="mt-3">
            ⚠ {getErrorMessage(dispute.error, '이의제기하지 못했어요.')}
          </Toast>
        )}
      </section>
    )
  }

  if (status === 'DISPUTE_REQUESTED' && isAuthor) {
    return (
      <section className="border-border bg-surface mt-5 rounded-2xl border p-4">
        <p className="text-ink mb-2 text-[13px] font-extrabold">
          🙋 이의제기가 접수됐어요
        </p>
        <p className="text-muted mb-3.5 text-[11.5px] leading-relaxed">
          제출한 그대로 다시 봐달라고 하거나, 내용을 고쳐서 다시 낼 수 있어요.
        </p>

        {mode === 'resubmit' ? (
          <>
            <TextAreaField
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="수정할 내용을 적어주세요"
              wrapperClassName="mb-3"
              className="min-h-28"
            />
            <div className="flex gap-2.5">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => setMode('none')}
              >
                취소
              </Button>
              <Button
                size="md"
                className="flex-1"
                disabled={!draft.trim() || resubmit.isPending}
                onClick={() =>
                  /*
                    명세는 원래 제출형식에 맞는 필드만 보내라고 한다
                    (텍스트면 submitContent, 사진이면 attachmentUrl).
                    사진 미션도 업로드 경로가 없어 지금은 본문만 고칠 수 있다 —
                    첨부 교체는 업로드가 붙은 뒤에 추가한다.
                  */
                  resubmit.mutate(
                    { submitContent: draft.trim() },
                    { onSuccess: () => setMode('none') },
                  )
                }
              >
                {resubmit.isPending ? '제출 중…' : '수정해서 다시 내기'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              size="md"
              className="flex-1"
              disabled={recheck.isPending}
              onClick={() => recheck.mutate()}
            >
              {recheck.isPending ? '요청 중…' : '🔁 그대로 재검토'}
            </Button>
            <Button
              size="md"
              className="flex-1"
              onClick={() => setMode('resubmit')}
            >
              ✏️ 수정 후 재제출
            </Button>
          </div>
        )}

        {(recheck.isError || resubmit.isError) && (
          <Toast tone="error" className="mt-3">
            ⚠{' '}
            {getErrorMessage(
              recheck.error ?? resubmit.error,
              '요청하지 못했어요.',
            )}
          </Toast>
        )}
      </section>
    )
  }

  /* 방장 재판정 — 대기 중인 건에 대해 승인/반려를 고른다 (FR-012c) */
  if (isWaitingReview && isOwner && !isAuthor) {
    return (
      <section className="border-primary/30 bg-primary-tint mt-5 rounded-2xl border p-4">
        <p className="text-ink mb-2 text-[13px] font-extrabold">
          👑 재판정이 필요해요
        </p>
        <p className="text-muted mb-3.5 text-[11.5px] leading-relaxed">
          AI 판정에 이의가 들어왔어요. 인증 내용을 보고 다시 판단해주세요.
        </p>

        {mode === 'reject' ? (
          <>
            <p className="text-muted mb-2 text-[11.5px] font-bold">반려 사유</p>
            <ChipGroup
              value={rejectCode}
              onChange={setRejectCode}
              items={REJECT_REASONS}
            />
            <div className="mt-3 flex gap-2.5">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => setMode('none')}
              >
                취소
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                disabled={review.isPending}
                onClick={() =>
                  review.mutate({
                    approved: false,
                    rejectReasonCode: rejectCode,
                  })
                }
              >
                {review.isPending ? '처리 중…' : '반려 확정'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={() => setMode('reject')}
            >
              반려하기
            </Button>
            <Button
              size="md"
              className="flex-1"
              disabled={review.isPending}
              onClick={() => review.mutate({ approved: true })}
            >
              {review.isPending ? '처리 중…' : '✅ 승인하기'}
            </Button>
          </div>
        )}

        {review.isError && (
          <Toast tone="error" className="mt-3">
            ⚠ {getErrorMessage(review.error, '판정하지 못했어요.')}
          </Toast>
        )}
      </section>
    )
  }

  /* 작성자가 방장 판정을 기다리는 중 — 너무 오래 걸리면 직접 확정시킬 수 있다 */
  if (isWaitingReview && isAuthor) {
    return (
      <section className="border-border bg-surface mt-5 rounded-2xl border p-4">
        <p className="text-ink mb-2 text-[13px] font-extrabold">
          ⏳ 방장의 재판정을 기다리고 있어요
        </p>
        <NoticeBox className="mb-3">
          💡 방장이 72시간 넘게 답하지 않으면 자동 승인을 요청할 수 있어요.
          방장이 없는 챌린지도 마찬가지예요.
        </NoticeBox>

        <Button
          variant="ghost"
          size="md"
          className="w-full"
          disabled={autoApprove.isPending}
          onClick={() => autoApprove.mutate()}
        >
          {autoApprove.isPending ? '요청 중…' : '⏱ 자동 승인 요청하기'}
        </Button>

        {autoApprove.isError && (
          <Toast tone="error" className="mt-3">
            ⚠{' '}
            {getErrorMessage(
              autoApprove.error,
              '아직 자동 승인을 요청할 수 없어요.',
            )}
          </Toast>
        )}
      </section>
    )
  }

  return null
}
