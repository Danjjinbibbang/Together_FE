import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { MissionAdminCard, StatRow } from '@/components/domain/MissionAdminCard'
import { Fab } from '@/components/layout/BottomTab'
import { MobileFrame, PageContent } from '@/components/layout/MobileFrame'
import { TopBar, TopBarAction } from '@/components/layout/TopBar'
import { AsyncBoundary } from '@/components/ui/AsyncBoundary'
import { EmptyState } from '@/components/ui/Feedback'
import { useChallenge } from '@/hooks/useChallenges'
import { useMissions, useUpdateMission } from '@/hooks/useMissions'

/** 23. 미션 관리 목록 (방장 전용, FR-007/FR-009) */
export function MissionManagementPage() {
  const navigate = useNavigate()
  const { challengeId: challengeIdParam = '' } = useParams()
  const challengeId = Number(challengeIdParam)
  const [searchParams] = useSearchParams()
  const isSetup = searchParams.get('setup') === '1'

  const challengeQuery = useChallenge(challengeId)
  const missionsQuery = useMissions(challengeId)
  const updateMission = useUpdateMission(challengeId)

  const missions = missionsQuery.data ?? []
  const activeCount = missions.filter((mission) => mission.isActive).length

  const goCreate = () =>
    navigate(
      `/challenges/${challengeId}/missions/new${isSetup ? '?setup=1' : ''}`,
    )

  return (
    <MobileFrame>
      <TopBar
        title={`${challengeQuery.data?.title ?? '챌린지'} · 미션 관리`}
        showBack
        right={
          <TopBarAction
            label="미션 추가"
            icon="+"
            variant="primary"
            onClick={goCreate}
          />
        }
      />

      <PageContent className="pb-24">
        <StatRow
          stats={[
            { label: '활성 미션', value: activeCount },
            { label: '비활성 미션', value: missions.length - activeCount },
          ]}
        />

        <AsyncBoundary
          query={missionsQuery}
          empty={
            <EmptyState>
              아직 등록된 미션이 없어요.
              <br />+ 버튼으로 첫 미션을 만들어보세요.
            </EmptyState>
          }
        >
          {(list) =>
            list.map((mission) => (
              <MissionAdminCard
                key={mission.missionId}
                mission={mission}
                disabled={updateMission.isPending}
                onToggleActive={(isActive) =>
                  updateMission.mutate({
                    missionId: mission.missionId,
                    body: { isActive },
                  })
                }
                onClick={() =>
                  navigate(
                    `/challenges/${challengeId}/missions/${mission.missionId}/edit`,
                  )
                }
              />
            ))
          }
        </AsyncBoundary>
      </PageContent>

      <Fab label="미션 추가" onClick={goCreate} />
    </MobileFrame>
  )
}
