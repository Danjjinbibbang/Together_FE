import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type {
  ChallengeDetailResponse,
  ChallengeListItem,
  ChallengeListResponse,
  CreateChallengeRequest,
  CreateChallengeResponse,
  ID,
  InviteCodeResponse,
  JoinChallengeRequest,
  JoinChallengeResponse,
  TransferOwnerRequest,
  TransferOwnerResponse,
  UpdateChallengeRequest,
  UpdateMissionModeRequest,
  UpdateMissionModeResponse,
} from '@/types/api'

/**
 * 내가 속한 챌린지 목록 (화면 03·04).
 * 응답이 { challenges: [...] }로 감싸여 오므로 여기서 벗겨 배열만 돌려준다.
 */
export async function fetchChallenges(): Promise<ChallengeListItem[]> {
  const { data } = await apiClient.get<ChallengeListResponse>(
    ENDPOINTS.challenges.root,
  )
  return data.challenges
}

/**
 * 챌린지 생성 (화면 05).
 * 서버가 챌린지·방장 멤버·계좌를 한 트랜잭션으로 만든다. 이 시점엔 missionMode가 아직 null이다.
 */
export async function createChallenge(body: CreateChallengeRequest) {
  const { data } = await apiClient.post<CreateChallengeResponse>(
    ENDPOINTS.challenges.root,
    body,
  )
  return data
}

/** 챌린지 상세 = 그룹 홈 (화면 08). progressRate는 서버 계산값이다. */
export async function fetchChallenge(challengeId: ID) {
  const { data } = await apiClient.get<ChallengeDetailResponse>(
    ENDPOINTS.challenges.detail(challengeId),
  )
  return data
}

/** 챌린지 정보 수정 — 방장이 아니면 403 (FR-036, 화면 21) */
export async function updateChallenge(
  challengeId: ID,
  body: UpdateChallengeRequest,
) {
  const { data } = await apiClient.patch<ChallengeDetailResponse>(
    ENDPOINTS.challenges.detail(challengeId),
    body,
  )
  return data
}

/** 초대코드/링크 조회 (화면 06) */
export async function fetchInviteCode(challengeId: ID) {
  const { data } = await apiClient.get<InviteCodeResponse>(
    ENDPOINTS.challenges.inviteCode(challengeId),
  )
  return data
}

/** 초대코드로 참여 — 닉네임이 중복이면 409 (화면 07) */
export async function joinChallenge(
  challengeId: ID,
  body: JoinChallengeRequest,
) {
  const { data } = await apiClient.post<JoinChallengeResponse>(
    ENDPOINTS.challenges.join(challengeId),
    body,
  )
  return data
}

/** 미션 운영 방식 설정 — 방장이 아니면 403 (FR-008, 화면 09) */
export async function updateMissionMode(
  challengeId: ID,
  body: UpdateMissionModeRequest,
) {
  const { data } = await apiClient.patch<UpdateMissionModeResponse>(
    ENDPOINTS.challenges.missionMode(challengeId),
    body,
  )
  return data
}

/**
 * 방장 양도 (FR-037, 화면 22).
 * 멤버 ROLE 두 건을 한 트랜잭션으로 바꾸며, 되돌릴 수 없다.
 */
export async function transferOwner(
  challengeId: ID,
  body: TransferOwnerRequest,
) {
  const { data } = await apiClient.patch<TransferOwnerResponse>(
    ENDPOINTS.challenges.owner(challengeId),
    body,
  )
  return data
}
