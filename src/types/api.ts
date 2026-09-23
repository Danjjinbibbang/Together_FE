/**
 * API 요청/응답 DTO — Notion "API 명세서" DB의 각 엔드포인트 페이지 본문 기준.
 *
 * 서버가 내려주는 모양을 그대로 옮긴 타입이다. 화면에서 쓰기 좋은 모양으로 바꾸는 일은
 * 훅(@/hooks) 계층에서 하고, 여기서는 명세를 왜곡하지 않는다.
 *
 * 확인된 규칙:
 *   - 모든 id는 숫자다 (challengeId, memberId, missionLogId ...)
 *   - 목록 응답은 배열이 아니라 이름 붙은 키로 감싸서 온다 ({ challenges: [...] })
 *   - 시각은 타임존 없는 ISO 문자열이다 ("2026-08-19T09:12:00")
 */

/** 서버 PK. 명세의 모든 예시가 숫자다. */
export type ID = number

/** "2026-08-19" */
export type ISODate = string
/** "2026-08-19T09:12:00" — 타임존 오프셋이 없다 */
export type ISODateTime = string

/* ── enum ─────────────────────────────────────────────────────── */

/** 챌린지 미션 운영 방식. 생성 직후에는 null이다. */
export type MissionMode = 'FIXED' | 'AI'

/** 멤버 역할 — 방장 정보의 유일한 소스는 MEMBERS.ROLE이다 */
export type MemberRole = 'OWNER' | 'MEMBER'

/** 멤버 상태 — 탈퇴해도 로우는 남고 LEFT로 바뀐다 (FR-038) */
export type MemberStatus = 'ACTIVE' | 'LEFT'

/** 미션 제출 형식 */
export type SubmitType = 'TEXT' | 'PHOTO'

/** 미션 생성 주체 */
export type CreatedByType = 'OWNER' | 'AI'

/** 미션 승인 상태 8단계 (FR-012 개정) */
export type MissionLogStatus =
  | 'SUBMITTED'
  | 'AI_APPROVED'
  | 'AI_REJECTED'
  | 'DISPUTE_REQUESTED'
  | 'RECHECK_REQUESTED'
  | 'RESUBMITTED'
  | 'OWNER_APPROVED'
  | 'OWNER_REJECTED'

/**
 * 마지막 판정 주체.
 * AUTO는 방장이 72시간 넘게 응답하지 않거나 활성 방장이 없어 자동 승인된 경우다
 * (2026-08-25 신설, FR-012c의 미확정 예외 처리).
 */
export type ReviewedBy = 'AI' | 'OWNER' | 'AUTO'

/** 반려 사유 코드 (FR-012e) */
export type RejectReasonCode = 'LOW_QUALITY' | 'LOW_LIGHT' | 'OFF_TOPIC' | 'ETC'

/**
 * 거래 유형.
 * REVERSAL·RE_PAYMENT는 재판정 로직의 부수효과로 서버가 만들며, 직접 호출하는 API는 없다.
 */
export type TransactionType = 'MISSION_REWARD' | 'REVERSAL' | 'RE_PAYMENT'

/**
 * 알림 종류 (백엔드 §13에서 3종으로 확정).
 * 알림함의 아이콘·문구를 이 값으로 분기한다.
 */
export type NotificationType =
  | 'MISSION_REWARD' // 팀원이 미션을 완료해 입금됨 — 팀원 전원에게
  | 'MISSION_REJECTED' // 내 미션이 반려됨 — 작성자 본인에게만 (FR-012a)
  | 'MISSION_DISPUTED' // 이의제기가 접수됨 — 방장에게만
  /**
   * 팀 전원이 각자 목표를 채움 — 팀원 전원에게 (FR-045, 2026-08-25 요청).
   *
   * 팀 달성은 마지막 팀원의 입금으로 발생해서, 이미 끝낸 사람은 미션 결과 화면(12)을
   * 거치지 않는다. 그래서 축하를 전할 길이 알림뿐이다.
   * ⚠️ 백엔드 신설 대기 중 — 아직 서버가 이 종류를 보내지 않는다.
   */
  | 'TEAM_GOAL_ACHIEVED'
  /** 팀원이 응원 메시지를 보냄 — 보낸 사람을 제외한 ACTIVE 팀원 전원에게 (FR-044) */
  | 'TEAM_CHEER'

/**
 * 알림이 가리키는 대상.
 * 원래 MISSION_LOG 하나뿐이었으나 챌린지·팀 메시지를 가리키는 알림이 생겼다.
 */
export type NotificationTargetType =
  'MISSION_LOG' | 'CHALLENGE' | 'TEAM_MESSAGE'

/**
 * 리액션 타입.
 * 멤버당 최대 1개만 존재한다 — UNIQUE(missionLogId, memberId).
 * 명세 예시에 CLAP/FIRE만 나와 있어 화면 14의 4종을 기준으로 확장했다.
 */
export type ReactionType = 'CLAP' | 'FIRE' | 'MUSCLE' | 'HEART'

/* ── Auth ─────────────────────────────────────────────────────── */

export interface KakaoLoginRequest {
  authorizationCode: string
}

export interface KakaoLoginResponse {
  accessToken: string
  /** true면 약관 동의(화면 01)로, false면 홈(화면 03)으로 분기 (FR-032) */
  isNewUser: boolean
  user: {
    userId: ID
    kakaoId: string
    createdAt: ISODateTime
  }
}

export interface TermsAgreementRequest {
  termsVersion: string
}

export interface TermsAgreementResponse {
  userId: ID
  termsAgreedAt: ISODateTime
  termsVersion: string
}

/* ── Challenge ────────────────────────────────────────────────── */

/** 목록 아이템 (화면 03·04) */
export interface ChallengeListItem {
  challengeId: ID
  title: string
  goalAmount: number
  /** 이 챌린지 소속 계좌 잔액 합산 */
  currentBalance: number
  startDate: ISODate
  endDate: ISODate
  memberCount: number
  /** 요청자 본인의 캘린더 색상 (FR-041) */
  themeColor?: string | null
}

export interface ChallengeListResponse {
  challenges: ChallengeListItem[]
}

/** 상세 = 그룹 홈 (화면 08) */
export interface ChallengeDetailResponse {
  challengeId: ID
  title: string
  goalAmount: number
  startDate: ISODate
  endDate: ISODate
  missionMode?: MissionMode | null
  inviteCode: string
  totalBalance: number
  /** 서버가 계산해 내려주는 진행률(%) — 프론트에서 다시 계산하지 않는다 */
  progressRate: number
  myRole: MemberRole
  myMemberId: ID
  /**
   * 이 챌린지에서의 내 연속 성공일 (FR-025①, 2026-08-25 추가).
   * 전체 활동 연속일(GET /me/calendar의 totalStreak)과 기준이 다르다 —
   * 이쪽은 성공한 날만 세고, 그쪽은 제출만 해도 인정한다.
   */
  myStreak: number
}

export interface CreateChallengeRequest {
  title: string
  goalAmount: number
  startDate: ISODate
  endDate: ISODate
  /** 방장 본인의 이 챌린지 전용 닉네임 (FR-003 개정) */
  nickname: string
}

export interface CreateChallengeResponse {
  challengeId: ID
  title: string
  goalAmount: number
  startDate: ISODate
  endDate: ISODate
  inviteCode: string
  /** 생성 직후에는 아직 운영 방식이 정해지지 않아 null이다 */
  missionMode?: MissionMode | null
  memberId: ID
  role: MemberRole
}

/** 보낸 필드만 수정된다 */
export interface UpdateChallengeRequest {
  title?: string
  goalAmount?: number
  startDate?: ISODate
  endDate?: ISODate
}

export interface InviteCodeResponse {
  inviteCode: string
  inviteUrl: string
}

export interface JoinChallengeRequest {
  inviteCode: string
  /** 이 챌린지에서만 쓰는 닉네임. 중복이면 409 */
  nickname: string
}

export interface JoinChallengeResponse {
  memberId: ID
  challengeId: ID
  nickname: string
  role: MemberRole
  status: MemberStatus
}

export interface UpdateMissionModeRequest {
  missionMode: MissionMode
}

export interface UpdateMissionModeResponse {
  challengeId: ID
  missionMode: MissionMode
}

export interface TransferOwnerRequest {
  newOwnerMemberId: ID
}

export interface TransferOwnerResponse {
  challengeId: ID
  previousOwnerMemberId: ID
  newOwnerMemberId: ID
}

/* ── Member ───────────────────────────────────────────────────── */

/** 멤버 목록 아이템 — themeColor는 개인 설정이라 포함되지 않는다 */
export interface MemberListItem {
  memberId: ID
  nickname: string
  role: MemberRole
  status: MemberStatus
  balance: number
  /**
   * 이 챌린지에서의 연속 성공일 (FR-025①, 2026-08-25 추가).
   * 성공(AI_APPROVED/OWNER_APPROVED)한 날만 세며, 오늘 안 했어도 어제까지 이어져 있으면 유지된다.
   * 기록이 없으면 0 — 키가 사라지지 않는다.
   */
  streak: number
}

export interface MemberListResponse {
  members: MemberListItem[]
}

/**
 * 알림 종류별 수신 여부 (챌린지별 개인 설정, 2026-08-24 신설).
 *
 * false면 그 챌린지에서 이 사용자에게 갈 알림을 아예 만들지 않는다 —
 * 나중에 다시 켜도 껐던 기간의 알림은 소급되지 않는다.
 *
 * 키를 고정하지 않고 맵으로 둔 이유: 서버가 종류를 늘리면 화면이 그대로 따라가야 한다
 * (설정 화면은 받은 키를 순회해 토글을 그린다).
 */
export type NotificationSettings = Partial<Record<NotificationType, boolean>>

export interface MyMemberResponse {
  memberId: ID
  userId: ID
  challengeId: ID
  nickname: string
  role: MemberRole
  status: MemberStatus
  themeColor?: string | null
  /**
   * ⚠️ 서버가 아직 이 응답에 담지 않는다 — PATCH 응답에만 들어 있다.
   *   그래서 알림 설정 화면이 현재 상태를 읽을 수 없어 아직 만들지 못했다.
   *   조회 응답에 추가해달라고 요청해둔 상태다 (claude 컨텍스트 §12).
   */
  notificationSettings?: NotificationSettings
}

/** 보낸 필드만 수정된다 */
export interface UpdateMyMemberRequest {
  nickname?: string
  /** 캘린더 색상 — 팀원에게 노출되지 않는 개인 설정 (FR-041, FR-042) */
  themeColor?: string
  /** 바꾸려는 종류만 담아 보내면 된다 (예: { MISSION_REWARD: false }) */
  notificationSettings?: NotificationSettings
}

export interface UpdateMyMemberResponse {
  memberId: ID
  nickname: string
  themeColor?: string | null
  notificationSettings?: NotificationSettings
}

/* ── Account ──────────────────────────────────────────────────── */

/** 챌린지 전체 합산 + 멤버별 잔액 (화면 03·08) */
export interface AccountSummaryResponse {
  totalBalance: number
  goalAmount: number
  progressRate: number
  accounts: {
    memberId: ID
    nickname: string
    balance: number
  }[]
}

export interface MyAccountResponse {
  accountId: ID
  memberId: ID
  balance: number
}

export interface TransactionItem {
  transactionId: ID
  missionLogId: ID
  /** REVERSAL·RE_PAYMENT일 때만 원거래 id가 들어온다 */
  originalTransactionId?: ID | null
  type: TransactionType
  /** 회수(REVERSAL)는 음수로 내려온다 */
  amount: number
  createdAt: ISODateTime
}

export interface TransactionListResponse {
  transactions: TransactionItem[]
}

/* ── Mission ──────────────────────────────────────────────────── */

/** 미션 목록 아이템 — 비활성 미션도 포함해서 내려온다 (화면 23) */
export interface MissionListItem {
  missionId: ID
  title: string
  submitType: SubmitType
  /**
   * 보상 범위.
   * 실제 지급액은 "오늘의 미션 배정 시점"에 이 범위에서 한 번만 뽑혀
   * 그날 그 챌린지의 모든 멤버에게 동일하게 적용된다 (FR-010 + FR-013).
   */
  rewardMin: number
  rewardMax: number
  isActive: boolean
  createdByType: CreatedByType
}

export interface MissionListResponse {
  missions: MissionListItem[]
}

export interface CreateMissionRequest {
  title: string
  submitType: SubmitType
  rewardMin: number
  rewardMax: number
  /** PHOTO 미션이면 null 허용 */
  minTextLength?: number | null
}

export interface CreateMissionResponse {
  missionId: ID
  challengeId: ID
  title: string
  submitType: SubmitType
  rewardMin: number
  rewardMax: number
  minTextLength?: number | null
  isActive: boolean
  createdByType: CreatedByType
  createdByMemberId: ID
}

/** 보낸 필드만 수정된다 */
export interface UpdateMissionRequest {
  title?: string
  rewardMin?: number
  rewardMax?: number
  minTextLength?: number | null
  isActive?: boolean
}

export interface UpdateMissionResponse {
  missionId: ID
  title: string
  rewardMin: number
  rewardMax: number
  minTextLength?: number | null
  isActive: boolean
}

export interface GenerateAiMissionsRequest {
  /** 챌린지 테마 (예: 운동, 절약, 독서) */
  theme: string
}

/**
 * AI 제안 목록.
 * 이 호출만으로는 저장되지 않는다 — 방장이 고른 것을 POST /missions로 다시 등록하는 2단계 흐름.
 */
export interface GenerateAiMissionsResponse {
  suggestions: {
    title: string
    submitType: SubmitType
    suggestedRewardMin: number
    suggestedRewardMax: number
  }[]
}

/**
 * 오늘의 미션 (화면 10).
 *
 * 오늘 배정 로우가 없으면 서버가 이 호출 시점에 랜덤 배정을 생성한다 (FR-010).
 * 이때 보상 금액도 함께 확정되어 그날 팀 전체가 같은 금액을 받는다.
 *
 * 다만 확정된 금액은 이 응답에 담기지 않는다 — 카드에는 범위만 보여주고
 * 정확한 금액은 미션 완료 후 화면 12에서 처음 공개하는 것이 기획 의도다.
 */
export interface TodayMissionAssigned {
  hasActiveMission: true
  assignmentId: ID
  missionId: ID
  title: string
  submitType: SubmitType
  /** 화면 10 카드에 "100~2,000원"으로 표시할 범위 (실제 금액은 완료 전까지 비공개) */
  rewardMin: number
  rewardMax: number
  minTextLength?: number | null
  assignedDate: ISODate
  /** 아직 제출 안 했으면 null (하루 1미션 제한, FR-014) */
  mySubmissionStatus?: MissionLogStatus | null
}

/**
 * 활성 미션이 하나도 없을 때 (2026-08-25 변경).
 * 오류가 아니라 정상 상태라 200으로 오고, 이때는 배정 자체를 만들지 않는다.
 */
export interface TodayMissionEmpty {
  hasActiveMission: false
}

/** hasActiveMission으로 두 경우를 갈라낸다 */
export type TodayMissionResponse = TodayMissionAssigned | TodayMissionEmpty

export interface SubmitMissionRequest {
  submitContent: string
  attachmentUrl?: string | null
  isPublic: boolean
}

export interface SubmitMissionResponse {
  missionLogId: ID
  status: MissionLogStatus
}

/* ── MissionLog ───────────────────────────────────────────────── */

/** 목록 조회 필터 (화면 16 캘린더는 date, 화면 26 피드는 파라미터 없음) */
export interface MissionLogListParams {
  date?: ISODate
  memberId?: ID
}

/** 목록 아이템 — 비공개면 submitContentPreview가 생략된다 (FR-016) */
export interface MissionLogListItem {
  missionLogId: ID
  assignmentId: ID
  missionTitle: string
  assignedDate: ISODate
  memberId: ID
  nickname: string
  status: MissionLogStatus
  reviewedBy?: ReviewedBy | null
  /** 미션의 rewardMin~rewardMax 범위에서 실제로 뽑힌 지급액 */
  rewardAmount: number
  isPublic: boolean
  submitContentPreview?: string
}

export interface MissionLogListResponse {
  missionLogs: MissionLogListItem[]
}

/** 상세 — 비공개이고 작성자 본인이 아니면 submitContent·attachmentUrl이 생략된다 */
export interface MissionLogDetailResponse {
  missionLogId: ID
  assignmentId: ID
  missionTitle: string
  challengeId: ID
  memberId: ID
  nickname: string
  submitContent?: string
  attachmentUrl?: string | null
  isPublic: boolean
  status: MissionLogStatus
  reviewedBy?: ReviewedBy | null
  rejectReasonCode?: RejectReasonCode | null
  rewardAmount: number
  createdAt: ISODateTime
}

/** 이의제기 — STATUS가 AI_REJECTED일 때만 호출 가능 */
export interface DisputeRequest {
  reason: string
}

/** 재제출 — 원래 제출형식에 맞는 필드만 보내면 된다 */
export interface ResubmitRequest {
  submitContent?: string
  attachmentUrl?: string
}

/** 이의제기 흐름의 상태 전환 응답은 모두 같은 모양이다 */
export interface MissionLogStatusResponse {
  missionLogId: ID
  status: MissionLogStatus
}

export interface ReviewRequest {
  approved: boolean
  /** approved=false일 때만 필요 */
  rejectReasonCode?: RejectReasonCode | null
}

/**
 * 재판정 결과.
 * 승인이면 보상 거래가, 이미 지급된 건을 반려하면 취소 거래가 함께 생성된다 (FR-012d).
 */
export interface ReviewResponse {
  missionLogId: ID
  status: MissionLogStatus
  reviewedBy: ReviewedBy
  rewardTransactionId?: ID
  reversalTransactionId?: ID
}

/* ── Social ───────────────────────────────────────────────────── */

export interface CommentItem {
  commentId: ID
  memberId: ID
  nickname: string
  content: string
  createdAt: ISODateTime
}

export interface CommentListResponse {
  comments: CommentItem[]
}

export interface CreateCommentRequest {
  content: string
}

export interface CreateCommentResponse {
  commentId: ID
  missionLogId: ID
  memberId: ID
  content: string
  createdAt: ISODateTime
}

/** 이모지별 집계 + 내가 남긴 반응 (멤버당 최대 1개) */
export interface ReactionSummaryResponse {
  reactionCounts: Partial<Record<ReactionType, number>>
  myReaction?: ReactionType | null
}

export interface ToggleReactionRequest {
  reactionType: ReactionType
}

export interface ToggleReactionResponse {
  missionLogId: ID
  memberId: ID
  reactionType: ReactionType
}

/* ── Notification ─────────────────────────────────────────────── */

export interface NotificationItem {
  notificationId: ID
  type: NotificationType
  /** 서버가 완성해 내려주는 문구 — 프론트에서 조합하지 않는다 */
  content: string
  targetType?: NotificationTargetType | null
  targetId?: ID | null
  isRead: boolean
  createdAt: ISODateTime
}

export interface NotificationListResponse {
  notifications: NotificationItem[]
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface ReadNotificationResponse {
  notificationId: ID
  isRead: boolean
}

/* ── Me (전 챌린지 통합, 2026-08-25 신설) ─────────────────────── */

/** 캘린더 한 칸에 찍을 챌린지별 활동 (화면 16) */
export interface CalendarDayChallenge {
  challengeId: ID
  challengeTitle: string
  /** 그 챌린지에서 본인이 지정한 색 (FR-041). 미지정이면 키가 없다 — 기본색은 프론트가 정한다 */
  themeColor?: string
  missionCount: number
  /** 거래 순액 — 오탐으로 회수(REVERSAL)된 건은 빠져 있다 */
  rewardAmount: number
}

export interface CalendarDay {
  date: ISODate
  totalReward: number
  challenges: CalendarDayChallenge[]
}

/**
 * 내 기록 캘린더 (FR-025②·FR-027·FR-041, 화면 16).
 *
 * 참여 중인 모든 챌린지를 합쳐서 온다 — 챌린지 수만큼 나눠 호출할 필요가 없다.
 * 활동이 없는 날은 days에 아예 담기지 않는다.
 */
export interface MyCalendarResponse {
  from: ISODate
  to: ISODate
  days: CalendarDay[]
  /**
   * 전체 활동 연속일 (FR-025②).
   * 모든 챌린지 통합, **제출한 날이면 인정**(승인 여부 무관).
   * 조회 범위와 무관하게 항상 오늘 기준이다.
   */
  totalStreak: number
}

/** 조회 범위. 생략하면 이번 달 1일~말일. 상한 366일 */
export interface MyCalendarParams {
  from?: ISODate
  to?: ISODate
}

/** 캘린더에서 날짜를 눌렀을 때의 내 미션 목록 (FR-040, 화면 16) */
export interface MyMissionLogItem {
  missionLogId: ID
  challengeId: ID
  challengeTitle: string
  themeColor?: string
  missionTitle: string
  assignedDate: ISODate
  status: MissionLogStatus
  reviewedBy?: ReviewedBy | null
  /** 그 기록의 지급액 — 회수돼도 값이 남아 캘린더의 순액과 다를 수 있다 */
  rewardAmount: number
  isPublic: boolean
}

export interface MyMissionLogsResponse {
  date: ISODate
  missionLogs: MyMissionLogItem[]
}

/* ── 팀 응원 메시지 (FR-044, 2026-08-25 신설) ────────────────── */

/**
 * 팀원 누구나 챌린지 전체에 보내는 한 줄 응원 (1:N).
 * 실시간 채팅이 아니라 단건 발송이고, 받는 쪽은 알림함에서 읽는다.
 */
export interface TeamMessage {
  messageId: ID
  senderMemberId: ID
  nickname: string
  content: string
  createdAt: ISODateTime
  /** 내가 보낸 메시지인지 — 말풍선 정렬·삭제 버튼 노출에 쓴다 */
  mine: boolean
  /** 값이 있으면 고쳐진 메시지다. 한 번도 안 고쳤으면 키가 없다. */
  updatedAt?: ISODateTime
}

/** 커서 방식 — 새 메시지가 앞에 끼어들어도 중복·누락이 없다 */
export interface TeamMessageListResponse {
  messages: TeamMessage[]
  /** 없으면 마지막 페이지다 (null은 키가 생략된다) */
  nextCursor?: ID
}

export interface TeamMessageListParams {
  cursor?: ID
  /** 기본 20, 상한 100 */
  size?: number
}

/** 최대 200자. 빈 문자열이면 400 */
export interface SendTeamMessageRequest {
  content: string
}

export interface SendTeamMessageResponse {
  messageId: ID
  challengeId: ID
  senderMemberId: ID
  content: string
  createdAt: ISODateTime
  /**
   * 실제로 알림을 받은 사람 수. 보낸 본인과 수신을 꺼둔 사람은 빠진다.
   * 0이면 "지금은 받을 사람이 없어요" 같은 안내를 보여준다.
   */
  notifiedMemberCount: number
}
