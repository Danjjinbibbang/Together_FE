import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomTab } from '@/components/layout/BottomTab'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/ui/Avatar'
import { AlertDialog, Toast } from '@/components/ui/Feedback'
import { ListGroup, ListRow } from '@/components/ui/ListRow'
import { getErrorMessage } from '@/api/client'
import { queryClient } from '@/api/queryClient'
import { useWithdrawAccount } from '@/hooks/useMe'
import { ROUTES } from '@/routes/paths'
import { useAuthStore } from '@/store/authStore'

/**
 * 27. 마이페이지.
 * v0.3 §4에서 지적된 "로그아웃/탈퇴 진입점 부재"를 해소하는 화면 (v0.4에서 MVP 포함).
 */
export function MyPage() {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<'logout' | 'withdraw' | null>(null)
  const signOut = useAuthStore((state) => state.signOut)
  const withdraw = useWithdrawAccount()

  /** 토큰을 지우고 캐시를 비운 뒤 로그인 화면으로. 캐시를 남기면 다음 계정에 비친다. */
  const handleSignOut = async () => {
    await signOut()
    queryClient.clear()
    navigate(ROUTES.login, { replace: true })
  }

  /**
   * 계정 탈퇴 (FR-043). 토큰 정리는 훅이 맡는다.
   * 방장으로 남아 있는 챌린지가 있으면 409로 막히므로 다이얼로그를 닫지 않고 사유를 보여준다.
   */
  const handleWithdraw = () =>
    withdraw.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.login, { replace: true }),
    })

  return (
    <MobileFrame>
      <TopBar title="마이페이지" />

      <PageContent className="pb-8">
        <div className="border-border bg-surface mb-5 flex items-center gap-3.5 rounded-[20px] border p-4.5">
          <Avatar name="나" size="lg" tone="solid" />
          <div>
            <p className="text-ink text-[15px] font-extrabold">카카오 계정</p>
            <p className="text-muted mt-1 text-[11px]">
              카카오 계정으로 로그인됨
            </p>
          </div>
        </div>

        <p className="text-muted mb-5 rounded-xl bg-[#F0F3F6] px-3 py-2.5 text-[11.5px] leading-relaxed">
          💡 닉네임은 챌린지마다 다르게 설정돼요. 여기서는 앱 전체 계정만 관리할
          수 있어요.
        </p>

        <ListGroup className="mb-4">
          <ListRow icon="🔔" title="알림 설정" onClick={() => {}} />
          <ListRow
            icon="📄"
            title="이용약관·개인정보처리방침"
            onClick={() => navigate(ROUTES.terms)}
          />
          <ListRow icon="❓" title="자주 묻는 질문" onClick={() => {}} />
        </ListGroup>

        <ListGroup>
          <ListRow
            icon="🚪"
            title="로그아웃"
            onClick={() => setConfirm('logout')}
          />
          <ListRow
            icon="⚠️"
            title="계정 탈퇴"
            tone="danger"
            onClick={() => setConfirm('withdraw')}
          />
        </ListGroup>
      </PageContent>

      <BottomTab />

      {confirm && (
        <div className="absolute inset-0 z-30 flex w-full flex-col items-center justify-center gap-3 bg-[#0F1720]/50 px-6">
          <AlertDialog
            className="w-full"
            icon={confirm === 'logout' ? '🚪' : '⚠️'}
            title={
              confirm === 'logout' ? '로그아웃할까요?' : '계정을 탈퇴할까요?'
            }
            description={
              confirm === 'logout'
                ? '다시 이용하려면 카카오로 로그인해야 해요.'
                : '참여 중인 모든 챌린지에서 나가게 되며, 기록은 복구할 수 없어요. 같은 카카오 계정으로 다시 가입해도 지난 기록과는 이어지지 않아요.'
            }
            confirmText={
              confirm === 'logout'
                ? '로그아웃'
                : withdraw.isPending
                  ? '탈퇴하는 중…'
                  : '탈퇴하기'
            }
            destructive={confirm === 'withdraw'}
            onCancel={() => setConfirm(null)}
            onConfirm={() =>
              confirm === 'logout' ? void handleSignOut() : handleWithdraw()
            }
          />

          {/* 방장으로 남아 있는 챌린지가 있으면 409 — 먼저 양도해야 한다 */}
          {confirm === 'withdraw' && withdraw.isError && (
            <Toast tone="error" className="w-full">
              ⚠ {getErrorMessage(withdraw.error, '탈퇴하지 못했어요.')}
            </Toast>
          )}
        </div>
      )}
    </MobileFrame>
  )
}
