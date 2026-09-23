/**
 * API 엔드포인트 경로 단일 정의.
 *
 * 출처: Notion "API 명세서" DB (같이모으기_API_Notion_Import.csv) — 총 37개.
 * 경로·메서드·인증 필요 여부는 명세에 확정되어 있으므로 그대로 옮겼다.
 * 문자열을 화면이나 훅에 직접 쓰지 말고 항상 여기를 거칠 것.
 */
import type { ID } from '@/types/api'

export const ENDPOINTS = {
  auth: {
    /** POST · 카카오 인가코드로 로그인/회원가입 (인증 불필요) */
    kakao: '/auth/kakao',
    /** POST · 최초 가입자 약관 동의 처리 (화면 01) */
    termsAgreement: '/auth/terms-agreement',
  },

  challenges: {
    /** GET 목록 (화면 04) · POST 생성 (화면 05·06) */
    root: '/challenges',
    /** GET 상세 (화면 08) · PATCH 정보 수정 (방장 전용, 화면 21) */
    detail: (challengeId: ID) => `/challenges/${challengeId}`,
    /** GET · 초대코드/링크 조회 (화면 06) */
    inviteCode: (challengeId: ID) => `/challenges/${challengeId}/invite-code`,
    /** POST · 초대코드로 참여, 닉네임 필요 (화면 07) */
    join: (challengeId: ID) => `/challenges/${challengeId}/join`,
    /** PATCH · 미션 운영 방식 설정 (방장 전용, 화면 09) */
    missionMode: (challengeId: ID) => `/challenges/${challengeId}/mission-mode`,
    /** PATCH · 방장 양도 (방장 전용, 화면 22) */
    owner: (challengeId: ID) => `/challenges/${challengeId}/owner`,
    /** GET 목록(커서) · POST 발송 — 팀 응원 메시지 (FR-044, 화면 08) */
    messages: (challengeId: ID) => `/challenges/${challengeId}/messages`,
    /** PATCH 수정 · DELETE 삭제 — 작성자 본인만 */
    message: (challengeId: ID, messageId: ID) =>
      `/challenges/${challengeId}/messages/${messageId}`,
  },

  members: {
    /** GET · 챌린지 내 멤버 목록 (화면 08) */
    list: (challengeId: ID) => `/challenges/${challengeId}/members`,
    /** GET 내 정보 · PATCH 닉네임 수정 · DELETE 탈퇴(STATUS→LEFT) */
    me: (challengeId: ID) => `/challenges/${challengeId}/members/me`,
  },

  accounts: {
    /** GET · 챌린지 전체 계좌 합산 (화면 03·08) */
    summary: (challengeId: ID) => `/challenges/${challengeId}/accounts`,
    /** GET · 내 가상 계좌 잔액 (화면 13) */
    me: (challengeId: ID) => `/challenges/${challengeId}/accounts/me`,
    /** GET · 거래 내역 (화면 13) */
    myTransactions: (challengeId: ID) =>
      `/challenges/${challengeId}/accounts/me/transactions`,
  },

  missions: {
    /** GET 미션 목록(방장 관리용, 화면 23) · POST 직접 생성(화면 24) */
    list: (challengeId: ID) => `/challenges/${challengeId}/missions`,
    /** POST · AI 미션 자동 생성 (방장 요청, 화면 24) */
    aiGenerate: (challengeId: ID) =>
      `/challenges/${challengeId}/missions/ai-generate`,
    /** GET · 오늘의 미션 카드뽑기 (화면 10) */
    today: (challengeId: ID) => `/challenges/${challengeId}/missions/today`,
    /** PATCH · 미션 수정/비활성화 (방장 전용, 화면 25) */
    detail: (missionId: ID) => `/missions/${missionId}`,
    /** POST · 미션 수행 최초 제출 (화면 11) */
    submit: (missionId: ID) => `/missions/${missionId}/submit`,
  },

  missionLogs: {
    /** GET · 미션 로그 목록 (캘린더/피드용, 화면 16·26) */
    list: (challengeId: ID) => `/challenges/${challengeId}/mission-logs`,
    /** GET · 미션 로그 상세 (화면 12·14) */
    detail: (missionLogId: ID) => `/mission-logs/${missionLogId}`,
    /** POST · AI 오탐 이의제기 (화면 12) */
    dispute: (missionLogId: ID) => `/mission-logs/${missionLogId}/dispute`,
    /** PATCH · 그대로 재검토 요청 (바디 없음) */
    disputeRecheck: (missionLogId: ID) =>
      `/mission-logs/${missionLogId}/dispute/recheck`,
    /** PATCH · 수정 후 재제출 */
    disputeResubmit: (missionLogId: ID) =>
      `/mission-logs/${missionLogId}/dispute/resubmit`,
    /** POST · 방장/2차 판독 재판정 */
    review: (missionLogId: ID) => `/mission-logs/${missionLogId}/review`,
    /**
     * POST · 자동 승인 요청 (작성자 본인, 2026-08-25 신설).
     * 방장 판정을 72시간 넘게 기다렸거나 활성 방장이 없을 때만 통과한다.
     */
    autoApprove: (missionLogId: ID) =>
      `/mission-logs/${missionLogId}/review/auto-approve`,
  },

  social: {
    /** GET 댓글 목록 · POST 댓글 작성 (화면 14) */
    comments: (missionLogId: ID) => `/mission-logs/${missionLogId}/comments`,
    /** DELETE · 댓글 삭제 (작성자 본인만) */
    comment: (commentId: ID) => `/comments/${commentId}`,
    /** GET 리액션 집계 · POST 등록/토글 (화면 14) */
    reactions: (missionLogId: ID) => `/mission-logs/${missionLogId}/reactions`,
  },

  /** 전 챌린지를 가로지르는 본인 데이터 (2026-08-25 신설) */
  me: {
    /** GET · 날짜별 활동 점 + 전체 활동 연속일 (화면 16) */
    calendar: '/me/calendar',
    /** GET · 특정 날짜의 내 미션 목록 (화면 16에서 날짜 선택) */
    missionLogs: '/me/mission-logs',
  },

  users: {
    /** DELETE · 계정 탈퇴 (FR-043, 화면 27) */
    me: '/users/me',
  },

  notifications: {
    /** GET · 내 알림 목록 (폴링, 화면 15) */
    root: '/notifications',
    /** GET · 상단바 뱃지용 미확인 개수 (전역) */
    unreadCount: '/notifications/unread-count',
    /** PATCH · 알림 읽음 처리 (바디 없음) */
    read: (notificationId: ID) => `/notifications/${notificationId}/read`,
  },
} as const
