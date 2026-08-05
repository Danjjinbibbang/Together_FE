# 프로젝트 개요

"같이 모으기" 프론트엔드 레포. 친구/소모임이 함께 저축 목표를 세우고 매일 랜덤 미션을 수행해 가상 계좌에 저축하는 소셜 저축 챌린지 서비스.

요구사항정의서/기획서/와이어프레임은 Notion에서 관리하며 Notion MCP로 연결되어 있음. 화면 작업 전 Notion에서 최신 문서를 먼저 확인할 것. 백엔드는 별도 레포(`같이모으기-backend`)이므로 API 계약은 아래 규칙을 따를 것.

# 기술 스택

- React 18 + TypeScript
- 서버 상태: TanStack Query (API로 가져오는 모든 데이터는 이걸 통해서만 접근)
- 전역 클라이언트 상태: Zustand (로그인 세션, 현재 선택된 챌린지 ID 등 여러 화면이 공유하는 값만)
- 로컬 UI 상태: `useState` (그 화면 안에서만 쓰는 값)
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios (인터셉터로 JWT 자동 첨부, 401 시 로그인 화면으로 리다이렉트)
- 인증: 카카오 소셜 로그인만 지원. JWT를 Capacitor Secure Storage에 저장
- 향후 배포: Capacitor로 WebView 래핑

# 폴더 구조

`/src/pages`(화면, Notion 화면 번호와 매칭) · `/src/components`(공통 컴포넌트) · `/src/hooks` · `/src/api`(axios 클라이언트, 화면에서 직접 fetch/axios 호출 금지) · `/src/store`(Zustand) · `/src/types`

# 컨벤션

- 컴포넌트 PascalCase, 훅은 `use` 접두사
- 서버 데이터는 반드시 TanStack Query 훅으로 감싸서 사용 (컴포넌트에서 직접 axios 호출 금지)
- 커밋: Conventional Commits (`feat:`, `fix:`, `refactor:`)

# API 계약

새 API가 필요하거나 응답 구조가 바뀌어야 하면, 추측하지 말고 Notion의 API 명세 페이지를 먼저 확인/갱신한 뒤 구현할 것.

# 하지 말아야 할 것

- `.env`, 토큰 등 시크릿 값 커밋 금지
- 백엔드 응답 구조를 임의로 단정해서 구현하지 말 것 (Notion API 명세 기준)