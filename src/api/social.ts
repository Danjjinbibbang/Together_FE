import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  CommentItem,
  CommentListResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  ID,
  ReactionSummaryResponse,
  ToggleReactionRequest,
  ToggleReactionResponse,
} from '@/types/api'

/**
 * 댓글·리액션 모두 대상이 MissionLog다 (v0.4 FR-022에서 Transaction → MissionLog로 정정).
 */

/** 댓글 목록 (화면 14) */
export async function fetchComments(missionLogId: ID): Promise<CommentItem[]> {
  const { data } = await apiClient.get<CommentListResponse>(
    ENDPOINTS.social.comments(missionLogId),
  )
  return data.comments
}

/** 댓글 작성 (FR-023, 화면 14) */
export async function createComment(
  missionLogId: ID,
  body: CreateCommentRequest,
) {
  const { data } = await apiClient.post<CreateCommentResponse>(
    ENDPOINTS.social.comments(missionLogId),
    body,
  )
  return data
}

/** 댓글 삭제 — 작성자 본인이 아니면 403. 204라 응답 바디가 없다. */
export async function deleteComment(commentId: ID) {
  await apiClient.delete(ENDPOINTS.social.comment(commentId))
}

/** 리액션 집계 — 이모지별 개수 + 내가 남긴 반응 (화면 14) */
export async function fetchReactions(missionLogId: ID) {
  const { data } = await apiClient.get<ReactionSummaryResponse>(
    ENDPOINTS.social.reactions(missionLogId),
  )
  return data
}

/**
 * 리액션 토글 (FR-022).
 *
 * 멤버당 반응은 최대 1개다 — 없으면 등록, 같은 타입이면 해제, 다른 타입이면 교체.
 * 응답은 집계가 아니라 내 반응 상태만 돌려주므로, 개수 갱신은 fetchReactions 재조회가 필요하다.
 */
export async function toggleReaction(
  missionLogId: ID,
  body: ToggleReactionRequest,
) {
  const { data } = await apiClient.post<ToggleReactionResponse>(
    ENDPOINTS.social.reactions(missionLogId),
    body,
  )
  return data
}
