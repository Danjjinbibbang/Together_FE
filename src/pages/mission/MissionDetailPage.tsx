import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CommentItem, ReactionBar } from '@/components/domain/Comments'
import { DisputePanel } from '@/components/domain/DisputePanel'
import { ReviewerTag, StatusStamp } from '@/components/domain/StatusStamp'
import {
  MobileFrame,
  PageContent,
  PageFooter,
} from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { NoticeBox } from '@/components/ui/NoticeBox'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useChallenge } from '@/hooks/useChallenges'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { useMissionLog } from '@/hooks/useMissionLogs'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useReactions,
  useToggleReaction,
} from '@/hooks/useSocial'
import { formatSignedWon } from '@/lib/format'
import type { ReactionType } from '@/types/api'

/**
 * 14. 미션 상세 (댓글/리액션).
 * v0.4 FR-022 정정으로 리액션·댓글 모두 MissionLog에 달린다.
 */
export function MissionDetailPage() {
  const { missionLogId: missionLogIdParam = '' } = useParams()
  const missionLogId = Number(missionLogIdParam)

  const logQuery = useMissionLog(missionLogId)
  /*
    이의제기·재판정은 "내가 작성자인지 / 방장인지"에 따라 갈린다.
    로그 응답에 challengeId가 있어 그걸로 챌린지 상세를 받아 내 역할을 안다.
  */
  const challengeQuery = useChallenge(logQuery.data?.challengeId ?? Number.NaN)
  const isAuthor = logQuery.data?.memberId === challengeQuery.data?.myMemberId
  const isOwner = challengeQuery.data?.myRole === 'OWNER'

  const commentsQuery = useComments(missionLogId)
  const reactionsQuery = useReactions(missionLogId)
  const createComment = useCreateComment(missionLogId)
  const deleteComment = useDeleteComment(missionLogId)
  const toggleReaction = useToggleReaction(missionLogId)

  const [draft, setDraft] = useState('')
  const keyboardInset = useKeyboardInset()
  const listEndRef = useRef<HTMLDivElement>(null)

  const commentCount = commentsQuery.data?.length ?? 0

  // 댓글이 늘어나면 방금 쓴 글이 보이도록 목록 끝으로 스크롤한다.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [commentCount])

  /** 멤버당 반응은 1개뿐이라 같은 걸 다시 누르면 해제, 다른 걸 누르면 교체된다 */
  const selectReaction = (type: ReactionType) =>
    toggleReaction.mutate({ reactionType: type })

  const submitComment = () => {
    const content = draft.trim()
    if (!content) return
    createComment.mutate({ content }, { onSuccess: () => setDraft('') })
  }

  return (
    <MobileFrame>
      <TopBar title={logQuery.data?.missionTitle ?? '미션'} showBack />

      <PageContent className="pb-6">
        <AsyncBoundary query={logQuery}>
          {(log) => (
            <>
              <div className="mb-3.5 flex items-center gap-2.5">
                <Avatar name={log.nickname} size="sm" tone="solid" />
                <div>
                  <p className="text-ink text-[13px] font-bold">
                    {log.nickname}
                  </p>
                  <p className="text-muted text-[11px]">
                    {new Date(log.createdAt).toLocaleString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <StatusStamp status={log.status} className="ml-auto" />
              </div>

              {log.reviewedBy && (
                <ReviewerTag
                  reviewer={log.reviewedBy}
                  reason={log.rejectReasonCode ?? undefined}
                />
              )}

              {/* 상태에 따라 이의제기 / 재판정 / 자동 승인 요청이 여기 붙는다 (FR-012a~e) */}
              <DisputePanel log={log} isAuthor={isAuthor} isOwner={isOwner} />

              {/* 비공개 기록을 남이 보면 서버가 submitContent를 아예 빼고 내려준다 (FR-016) */}
              {log.submitContent ? (
                <div className="border-border bg-surface text-ink mt-3.5 mb-3.5 rounded-[18px] border p-4 text-[13px] leading-7">
                  {log.submitContent}
                </div>
              ) : (
                <NoticeBox className="mt-3.5 mb-3.5">
                  🔒 비공개로 작성된 미션이에요. 완료 여부와 보상 금액만 볼 수
                  있어요.
                </NoticeBox>
              )}

              <Badge tone="accent" size="lg" className="mb-5">
                🪙 {formatSignedWon(log.rewardAmount)} 획득
              </Badge>
            </>
          )}
        </AsyncBoundary>

        <ReactionBar
          counts={reactionsQuery.data?.reactionCounts ?? {}}
          myReaction={reactionsQuery.data?.myReaction ?? null}
          onSelect={selectReaction}
          disabled={toggleReaction.isPending || reactionsQuery.isPending}
        />

        <SectionLabel>댓글 {commentCount}</SectionLabel>
        <AsyncBoundary
          query={commentsQuery}
          empty={
            <p className="text-muted py-6 text-center text-[12.5px]">
              첫 댓글을 남겨보세요
            </p>
          }
        >
          {(comments) => (
            <ul>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  // 내 멤버 id와 같을 때만 노출한다 — 서버도 403으로 막는다
                  canDelete={
                    comment.memberId === challengeQuery.data?.myMemberId
                  }
                  onDelete={() => deleteComment.mutate(comment.commentId)}
                />
              ))}
            </ul>
          )}
        </AsyncBoundary>
        <div ref={listEndRef} />
      </PageContent>

      {/*
        키보드가 올라오면 그만큼 입력창을 밀어 올린다.
        transform이라 리플로우 없이 움직이고, 키보드가 없으면 0이라 그대로다.
      */}
      <PageFooter
        solid
        className="flex gap-2.5 transition-transform duration-200"
        style={{ transform: `translateY(-${keyboardInset}px)` }}
      >
        <form
          className="flex flex-1 gap-2.5"
          onSubmit={(event) => {
            event.preventDefault()
            submitComment()
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="댓글을 남겨보세요"
            aria-label="댓글 입력"
            // 모바일 키보드의 확인 키를 "전송"으로 바꿔 엔터로 바로 등록되게 한다
            enterKeyHint="send"
            autoComplete="off"
            className="border-border bg-bg flex-1 rounded-full border px-4 py-3 text-[13px] outline-none"
          />
          <button
            type="submit"
            aria-label="댓글 등록"
            disabled={!draft.trim() || createComment.isPending}
            className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-full text-base text-white disabled:opacity-40"
          >
            ➤
          </button>
        </form>
      </PageFooter>
    </MobileFrame>
  )
}
