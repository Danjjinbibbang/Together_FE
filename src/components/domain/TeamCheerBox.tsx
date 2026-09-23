import { useState } from 'react'

import { getErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Feedback'
import { SectionLabel } from '@/components/ui/SectionLabel'
import {
  useDeleteTeamMessage,
  useSendTeamMessage,
  useTeamMessages,
} from '@/hooks/useTeamMessages'
import type { ID } from '@/types/api'

/** 명세 제한 — 넘기면 서버가 400을 준다 */
const MAX_LENGTH = 200

/**
 * 팀 응원 메시지 (FR-044, 화면 08).
 *
 * 목표를 먼저 채운 사람이 아직 모으는 중인 팀원을 응원하는 자리다.
 * 보내면 나를 뺀 ACTIVE 팀원 전원의 알림함으로 간다 — 실시간 채팅이 아니라 단건 발송이다.
 *
 * 하루 5건 제한이 있어 429가 흔하다. 알림이 멤버 수만큼 복제되는 구조라
 * 한 사람의 남용이 팀 전체 알림함을 덮기 때문이다.
 */
export function TeamCheerBox({ challengeId }: { challengeId: ID }) {
  const [draft, setDraft] = useState('')
  const [sentNotice, setSentNotice] = useState<string | null>(null)

  const { data: messages = [] } = useTeamMessages(challengeId)
  const sendMessage = useSendTeamMessage(challengeId)
  const deleteMessage = useDeleteTeamMessage(challengeId)

  const content = draft.trim()
  const tooLong = draft.length > MAX_LENGTH

  const submit = () => {
    if (!content || tooLong) return
    sendMessage.mutate(
      { content },
      {
        onSuccess: (result) => {
          setDraft('')
          // 받을 사람이 0명일 수 있다 — 혼자 남았거나 다들 알림을 꺼둔 경우다
          setSentNotice(
            result.notifiedMemberCount > 0
              ? `${result.notifiedMemberCount}명에게 전했어요 🙌`
              : '지금은 받을 팀원이 없어요',
          )
          setTimeout(() => setSentNotice(null), 3000)
        },
      },
    )
  }

  return (
    <section className="mb-5">
      <SectionLabel tone="muted">팀 응원</SectionLabel>

      <form
        className="border-border bg-surface rounded-2xl border p-3.5"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="flex gap-2.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="팀원에게 한 줄 응원을 보내보세요"
            aria-label="응원 메시지"
            enterKeyHint="send"
            autoComplete="off"
            className="border-border bg-bg text-ink flex-1 rounded-full border px-4 py-2.5 text-[13px] outline-none"
          />
          <Button
            type="submit"
            size="md"
            disabled={!content || tooLong || sendMessage.isPending}
            className="shrink-0 px-4"
          >
            {sendMessage.isPending ? '보내는 중…' : '보내기'}
          </Button>
        </div>

        {tooLong && (
          <p role="alert" className="text-danger mt-2 text-[11px]">
            {MAX_LENGTH}자까지 보낼 수 있어요 (현재 {draft.length}자)
          </p>
        )}

        {sentNotice && (
          <p className="text-muted mt-2 text-[11px]">{sentNotice}</p>
        )}

        {sendMessage.isError && (
          <Toast tone="error" className="mt-2.5">
            ⚠ {getErrorMessage(sendMessage.error, '응원을 보내지 못했어요.')}
          </Toast>
        )}
      </form>

      {messages.length > 0 && (
        <ul className="mt-3">
          {messages.map((message) => (
            <li
              key={message.messageId}
              className="border-border flex items-start gap-2.5 border-b py-2.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1">
                <span className="text-muted block text-[11px]">
                  {message.nickname}
                  {/* 고친 적이 있으면 updatedAt이 온다 */}
                  {message.updatedAt && ' · 수정됨'}
                </span>
                <span className="text-ink block text-[12.5px] break-words">
                  {message.content}
                </span>
              </span>

              {message.mine && (
                <button
                  type="button"
                  onClick={() => deleteMessage.mutate(message.messageId)}
                  disabled={deleteMessage.isPending}
                  aria-label="내 응원 메시지 삭제"
                  className="text-muted shrink-0 pt-3 text-[11px]"
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {deleteMessage.isError && (
        <Toast tone="error" className="mt-2.5">
          ⚠ {getErrorMessage(deleteMessage.error, '삭제하지 못했어요.')}
        </Toast>
      )}
    </section>
  )
}
