import { createBrowserRouter } from 'react-router-dom'

import { AccountDetailPage } from '@/pages/account/AccountDetailPage'
import { KakaoCallbackPage } from '@/pages/auth/KakaoCallbackPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SplashPage } from '@/pages/auth/SplashPage'
import { TermsPage } from '@/pages/auth/TermsPage'
import { ChallengeCreatePage } from '@/pages/challenge/ChallengeCreatePage'
import { ChallengeEditPage } from '@/pages/challenge/ChallengeEditPage'
import { ChallengeJoinPage } from '@/pages/challenge/ChallengeJoinPage'
import { ChallengeListPage } from '@/pages/challenge/ChallengeListPage'
import { GoalCelebrationPage } from '@/pages/challenge/GoalCelebrationPage'
import { GroupHomePage } from '@/pages/challenge/GroupHomePage'
import { InviteSharePage } from '@/pages/challenge/InviteSharePage'
import { OwnerTransferPage } from '@/pages/challenge/OwnerTransferPage'
import { TeamFeedPage } from '@/pages/challenge/TeamFeedPage'
import { ComponentCatalogPage } from '@/pages/dev/ComponentCatalogPage'
import { HomePage } from '@/pages/home/HomePage'
import { MissionCreatePage } from '@/pages/mission/MissionCreatePage'
import { MissionDetailPage } from '@/pages/mission/MissionDetailPage'
import { MissionDrawPage } from '@/pages/mission/MissionDrawPage'
import { MissionEditPage } from '@/pages/mission/MissionEditPage'
import { MissionManagementPage } from '@/pages/mission/MissionManagementPage'
import { MissionModePage } from '@/pages/mission/MissionModePage'
import { MissionResultPage } from '@/pages/mission/MissionResultPage'
import { MissionWritePage } from '@/pages/mission/MissionWritePage'
import { MyCalendarPage } from '@/pages/my/MyCalendarPage'
import { MyPage } from '@/pages/my/MyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NotificationsPage } from '@/pages/my/NotificationsPage'
import { ROUTES } from '@/routes/paths'

/**
 * 라우트 정의. 각 화면 번호는 Notion 와이어프레임 ver3와 1:1 대응한다.
 *
 * 화면 02(닉네임 설정)는 v0.4 FR-003에 따라 흐름에서 제거됐다 —
 * 닉네임은 전역이 아니라 챌린지별 값이므로 05·07 화면의 입력 필드로 이동했다.
 *
 * TODO: 인증 가드(ProtectedRoute) 재적용. 지금은 퍼블리싱 확인을 위해 전 화면을 열어둔 상태다.
 */
export const router = createBrowserRouter([
  // 인증 · 온보딩
  { path: ROUTES.splash, element: <SplashPage /> }, // 00
  { path: ROUTES.login, element: <LoginPage /> }, // 19
  { path: ROUTES.kakaoCallback, element: <KakaoCallbackPage /> }, // 20
  { path: ROUTES.terms, element: <TermsPage /> }, // 01

  // 홈 · 챌린지
  { path: ROUTES.home, element: <HomePage /> }, // 03 + 03b
  { path: ROUTES.challenges, element: <ChallengeListPage /> }, // 04
  { path: ROUTES.challengeCreate, element: <ChallengeCreatePage /> }, // 05
  { path: ROUTES.challengeJoin, element: <ChallengeJoinPage /> }, // 07
  { path: ROUTES.challenge(), element: <GroupHomePage /> }, // 08
  { path: ROUTES.challengeInvite(), element: <InviteSharePage /> }, // 06
  { path: '/challenges/:challengeId/edit', element: <ChallengeEditPage /> }, // 21
  {
    path: '/challenges/:challengeId/owner-transfer',
    element: <OwnerTransferPage />,
  }, // 22
  { path: '/challenges/:challengeId/feed', element: <TeamFeedPage /> }, // 26
  { path: ROUTES.celebration(), element: <GoalCelebrationPage /> }, // 17

  // 미션
  { path: ROUTES.missionMode(), element: <MissionModePage /> }, // 09
  { path: ROUTES.missionDraw(), element: <MissionDrawPage /> }, // 10
  { path: ROUTES.missionWrite(), element: <MissionWritePage /> }, // 11
  { path: ROUTES.missionResult(), element: <MissionResultPage /> }, // 12
  {
    path: '/challenges/:challengeId/missions',
    element: <MissionManagementPage />,
  }, // 23
  {
    path: '/challenges/:challengeId/missions/new',
    element: <MissionCreatePage />,
  }, // 24
  {
    path: '/challenges/:challengeId/missions/:missionId/edit',
    element: <MissionEditPage />,
  }, // 25
  { path: ROUTES.missionLog(), element: <MissionDetailPage /> }, // 14

  // 계좌
  { path: ROUTES.account(), element: <AccountDetailPage /> }, // 13 + 13b

  // 마이
  { path: ROUTES.notifications, element: <NotificationsPage /> }, // 15
  { path: ROUTES.myCalendar, element: <MyCalendarPage /> }, // 16 + 16b
  { path: ROUTES.myPage, element: <MyPage /> }, // 27

  // 개발용 컴포넌트 카탈로그 (18 + 12·14 뱃지)
  { path: ROUTES.components, element: <ComponentCatalogPage /> },

  { path: '*', element: <NotFoundPage /> },
])
