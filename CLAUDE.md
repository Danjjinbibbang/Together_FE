# 프로젝트 개요

"같이 모으기" 프론트엔드 레포. 친구/소모임이 함께 저축 목표를 세우고 매일 랜덤 미션을 수행해 가상 계좌에 저축하는 소셜 저축 챌린지 서비스.

요구사항정의서/기획서/와이어프레임은 Notion에서 관리하며 Notion MCP로 연결되어 있음. 화면 작업 전 Notion에서 최신 문서를 먼저 확인할 것. 백엔드는 별도 레포(`같이모으기-backend`)이므로 API 계약은 아래 규칙을 따를 것.

# 기술 스택

- React 19 + TypeScript
- 서버 상태: TanStack Query (API로 가져오는 모든 데이터는 이걸 통해서만 접근)
- 전역 클라이언트 상태: Zustand (로그인 세션, 현재 선택된 챌린지 ID 등 여러 화면이 공유하는 값만)
- 로컬 UI 상태: `useState` (그 화면 안에서만 쓰는 값)
- 빌드 도구: Vite
- 라우팅: react-router-dom (`createBrowserRouter`)
- 스타일링: Tailwind CSS v4 (**CSS-first 설정 — `tailwind.config.js`가 없음**. 디자인 토큰은 `src/index.css`의 `@theme` 블록에서 정의)
- HTTP 클라이언트: axios (인터셉터로 JWT 자동 첨부, 401 시 로그인 화면으로 리다이렉트)
- 인증: 카카오 소셜 로그인만 지원. JWT를 Capacitor Secure Storage에 저장
- 향후 배포: Capacitor로 WebView 래핑

# 폴더 구조

`/src/pages`(화면, Notion 화면 번호와 매칭) · `/src/components`(공통 컴포넌트) · `/src/hooks`(TanStack Query 훅) · `/src/api`(axios 클라이언트 + queryClient/queryKeys, 화면에서 직접 fetch/axios 호출 금지) · `/src/store`(Zustand) · `/src/types` · `/src/routes`(라우트 정의, 인증 가드) · `/src/lib`(env, 토큰 저장소 등 프레임워크 비의존 유틸)

# 개발 명령어

`npm run dev`(개발 서버) · `npm run build`(타입체크+빌드) · `npm run typecheck` · `npm run lint`(oxlint) · `npm run format`(prettier)

최초 세팅 시 `.env.example`을 `.env.local`로 복사해 값을 채울 것.

# 컨벤션

- 컴포넌트 PascalCase, 훅은 `use` 접두사
- import는 `@/` 별칭 사용 (`@/api/client` → `src/api/client`). 상대경로 `../../` 금지
- 서버 데이터는 반드시 TanStack Query 훅으로 감싸서 사용 (컴포넌트에서 직접 axios 호출 금지)
- 쿼리 키는 문자열을 직접 쓰지 말고 `@/api/queryClient`의 `queryKeys`에 추가해서 사용
- 환경변수는 `import.meta.env` 직접 접근 대신 `@/lib/env`를 거칠 것
- 커밋: Conventional Commits (`feat:`, `fix:`, `refactor:`)

# API 계약

새 API가 필요하거나 응답 구조가 바뀌어야 하면, 추측하지 말고 Notion의 API 명세 페이지를 먼저 확인/갱신한 뒤 구현할 것.

# Notion 기록 (필수)

**기획·요구사항·API 계약에 영향을 주는 변경이 생기면 반드시 Notion에 먼저 기록한 뒤 코드를 고칠 것.** 코드만 고치고 넘어가지 말 것 — 백엔드는 레포가 분리되어 Notion만 보고 구현하므로, 기록하지 않으면 양쪽 구현이 조용히 어긋난다.

기록 대상과 위치:

- **요청/응답 스키마 변경** → 해당 엔드포인트의 API 명세서 DB 페이지 본문
- **동작 규칙·정책 결정** (예: 랜덤 보상을 언제 뽑는지) → 관련 엔드포인트 페이지 + `claude 컨텍스트` > "프론트 구현 중 확정·변경 사항"
- **요구사항 자체의 변경/해석 확정** → `claude 컨텍스트`의 같은 섹션에 사유와 함께
- **문서 간 불일치를 발견했을 때** → 임의로 한쪽을 고르지 말고, 어느 문서가 최신인지 확인한 뒤 기록하고 진행

기록에는 "무엇을 바꿨는지"와 함께 **왜 그렇게 정했는지**를 남길 것. 나중에 백엔드나 다른 세션이 같은 판단을 다시 하지 않도록.

# 하지 말아야 할 것

- `.env`, 토큰 등 시크릿 값 커밋 금지
- 백엔드 응답 구조를 임의로 단정해서 구현하지 말 것 (Notion API 명세 기준)