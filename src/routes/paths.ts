/**
 * 라우트 경로 단일 정의.
 * 화면 번호는 Notion 와이어프레임 ver3 파일명과 1:1 대응한다.
 */
export const ROUTES = {
  /** 00 앱 스플래시 */
  splash: '/splash',
  /** 19 로그인 */
  login: '/login',
  /** 20 카카오 인증 처리 중 */
  kakaoCallback: '/oauth/kakao/callback',
  /** 01 약관 동의 (카카오 인증 성공 + 신규 User) */
  terms: '/onboarding/terms',

  /** 03 홈 대시보드 */
  home: '/',
  /** 04 챌린지 목록 */
  challenges: '/challenges',
  /** 05 챌린지 생성 */
  challengeCreate: '/challenges/new',
  /** 07 초대코드로 참여 */
  challengeJoin: '/challenges/join',

  /** 08 그룹 홈 */
  challenge: (id = ':challengeId') => `/challenges/${id}`,
  /** 06 초대코드 공유 */
  challengeInvite: (id = ':challengeId') => `/challenges/${id}/invite`,
  /** 09 미션 운영 방식 설정 */
  missionMode: (id = ':challengeId') => `/challenges/${id}/mission-mode`,
  /** 10 오늘의 미션 뽑기 */
  missionDraw: (id = ':challengeId') => `/challenges/${id}/mission/draw`,
  /** 11 미션 작성 */
  missionWrite: (id = ':challengeId') => `/challenges/${id}/mission/write`,
  /** 12 미션 완료 결과 */
  missionResult: (id = ':challengeId') => `/challenges/${id}/mission/result`,
  /** 17 목표 달성 축하 */
  celebration: (id = ':challengeId') => `/challenges/${id}/celebration`,
  /** 13 계좌 상세 */
  account: (challengeId = ':challengeId', memberId = ':memberId') =>
    `/challenges/${challengeId}/accounts/${memberId}`,

  /** 14 미션 상세 (댓글/리액션) */
  missionLog: (id = ':missionLogId') => `/mission-logs/${id}`,

  /** 15 알림함 */
  notifications: '/notifications',
  /** 16 내 기록 캘린더 */
  myCalendar: '/my/records',
  /** 27 마이페이지 */
  myPage: '/my',

  /** 18 시스템 알림 컴포넌트 카탈로그 (개발용) */
  components: '/dev/components',
} as const
