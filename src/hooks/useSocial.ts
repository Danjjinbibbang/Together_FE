import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/api/queryClient'
import {
  createComment,
  deleteComment,
  fetchComments,
  fetchReactions,
  toggleReaction,
} from '@/api/social'
import type {
  CreateCommentRequest,
  ID,
  ToggleReactionRequest,
} from '@/types/api'

/** 댓글 목록 (화면 14) */
export function useComments(missionLogId: ID) {
  return useQuery({
    queryKey: queryKeys.comments(String(missionLogId)),
    queryFn: () => fetchComments(missionLogId),
    enabled: Number.isFinite(missionLogId),
  })
}

/** 댓글 작성 (FR-023, 화면 14) */
export function useCreateComment(missionLogId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCommentRequest) =>
      createComment(missionLogId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.comments(String(missionLogId)),
      })
    },
  })
}

/** 댓글 삭제 — 작성자 본인이 아니면 403 */
export function useDeleteComment(missionLogId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (commentId: ID) => deleteComment(commentId),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.comments(String(missionLogId)),
      })
    },
  })
}

/** 리액션 집계 — 이모지별 개수 + 내가 남긴 반응 (화면 14) */
export function useReactions(missionLogId: ID) {
  return useQuery({
    queryKey: queryKeys.reactions(String(missionLogId)),
    queryFn: () => fetchReactions(missionLogId),
    enabled: Number.isFinite(missionLogId),
  })
}

/**
 * 리액션 토글 (FR-022).
 *
 * 서버 응답은 집계가 아니라 "내 반응"만 돌려준다. 개수를 맞추려면
 * 성공 후 집계를 다시 읽어야 한다.
 */
export function useToggleReaction(missionLogId: ID) {
  const client = useQueryClient()

  return useMutation({
    mutationFn: (body: ToggleReactionRequest) =>
      toggleReaction(missionLogId, body),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: queryKeys.reactions(String(missionLogId)),
      })
    },
  })
}
