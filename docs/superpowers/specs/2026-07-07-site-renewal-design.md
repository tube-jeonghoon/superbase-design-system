# 사이트 리뉴얼 (Sub-project B) — 설계

날짜: 2026-07-07
상태: 설계 확정 대기
선행: `2026-07-06-foundation-token-overhaul-design.md` (A, 완료·main 병합됨)

## 배경

SDS.design 문서 사이트 리뉴얼 시안의 나머지 — 공용 상단 네비 셸 + 홈 + 컴포넌트 목록 + 컴포넌트 상세 + 릴리즈. A에서 브랜드가 그린으로 교체됐으므로, 컴포넌트 미리보기가 자연히 그린으로 렌더된다(별도 스킨 불필요).

## 확정된 결정

- **브랜드/데이터**: 그린 토큰(A 완료). 실제 저장소 기준 — 컴포넌트 **17종**, `@superbase/react` **v0.5.0**, 실제 릴리즈 4개(0.5.0/0.4.0/0.3.0/0.2.0).
- **레이아웃 전환**: 기존 "모든 페이지 좌측 사이드바(AppShell)" → **상단 네비 기반**. 홈·목록·파운데이션·릴리즈는 풀폭, **상세만** 좌측 그룹 사이드바.
- **상세 깊이**: **Button만 시안 수준**(Variants 표 + Do/Don't). 나머지 16종은 새 탭 셸에 기존 `ComponentDoc` 콘텐츠를 얹음(점진 확장).
- **다크모드**: 네비에 은은하게 유지(기존 `ThemeToggle` 재사용).
- **네비 라우팅**: 원칙 → 홈 `#principles` 앵커, 파운데이션 → `/foundations`, 컴포넌트 → `/components`, 릴리즈 → 신규 `/releases`. Get started → `/components`.

## 파일 구조

신규/변경:
- `apps/docs/components/site/SiteHeader.tsx` (+ `.module.css`) — 상단 네비(로고·링크·Get started·ThemeToggle). `usePathname`으로 활성 표시. 클라이언트 컴포넌트.
- `apps/docs/components/site/SiteFooter.tsx` (+ `.module.css`) — 그린 푸터(© · GitHub · Figma · Changelog).
- `apps/docs/lib/catalog.ts` — 컴포넌트 카탈로그(단일 소스): 항목·카테고리·상태.
- `apps/docs/lib/catalog.test.ts` — 카탈로그 무결성 테스트(슬러그가 실제 페이지와 일치, 카테고리 커버리지).
- `apps/docs/lib/releases.ts` — 실제 CHANGELOG 기반 큐레이션 릴리즈 배열.
- `apps/docs/lib/releases.test.ts` — 릴리즈 데이터 형태 테스트.
- `apps/docs/app/layout.tsx` — `AppShell` 대신 `SiteHeader` + `{children}` + `SiteFooter`로 교체.
- `apps/docs/components/AppShell.tsx` — **제거**(역할이 SiteHeader/SiteFooter + 상세 레이아웃으로 분해됨). 기존 `SideNav`도 상세 사이드바로 대체되면 제거.
- `apps/docs/app/page.tsx` — 홈 마케팅 레이아웃으로 재작성.
- `apps/docs/app/components/page.tsx` — 목록(3열 그리드 + 카테고리 필터 + 검색)으로 재작성.
- `apps/docs/app/components/(reference)/layout.tsx` — 상세 전용 그룹 사이드바 레이아웃(Next.js route group).
- `apps/docs/app/components/(reference)/<slug>/page.tsx` — 기존 17개 상세 디렉터리를 route group으로 `git mv`(URL 불변). 각 페이지는 새 탭 셸 사용.
- `apps/docs/app/components/button/…` → Button은 Variants 표 + Do/Don't까지 확장.
- `apps/docs/app/releases/page.tsx` — 신규 전체 릴리즈 페이지.
- `apps/docs/components/docs/ComponentDoc.tsx` — 상세 탭(디자인/코드/접근성) 셸 지원하도록 확장(또는 신규 `ComponentShell`로 분리).

### 상세 사이드바를 route group으로 두는 이유
`app/components/page.tsx`(목록)와 `app/components/<slug>/page.tsx`(상세)가 형제라서, `app/components/layout.tsx`를 두면 목록에도 사이드바가 붙는다. Next.js **route group `(reference)`** 는 URL에 영향을 주지 않으면서 그 안의 라우트에만 `layout.tsx`를 적용하므로, 상세만 사이드바를 갖고 목록은 풀폭을 유지한다. 상세 17개 디렉터리를 `app/components/(reference)/` 아래로 이동(URL `/components/<slug>` 불변).

## 페이지별 설계

### 공용 셸
- **SiteHeader**: 좌 `● SDS.design`(로고), 우 `원칙 · 파운데이션 · 컴포넌트 · 릴리즈`(활성 라우트 그린 밑줄) + `Get started` 아웃라인 버튼 + `ThemeToggle`(작게). sticky top.
- **SiteFooter**: green.900 배경, 흰 텍스트. 좌 `© 2026 Superbase Design System`, 우 `GitHub · Figma · Changelog RSS`(GitHub는 실제 repo 링크, 나머지는 placeholder `#`).

### 홈 `/`
1. 히어로 2단 — 좌 green.900 패널: eyebrow `SUPERBASE DESIGN SYSTEM`, 대형 헤드라인 "하나의 언어로, 모든 제품을.", 서브카피, `시작하기`(→/components)·`Docs 보기`(→/foundations). 우 흰 카드 `Design Tokens`: 실제 토큰(brand/green·gray-neutral·status) 4줄 스와치 + 라벨 + hex(CSS 변수에서 읽음).
2. 세 가지 원칙(`id="principles"`) — Clarity first / Token-driven / Open by default.
3. CTA 2카드 — "디자이너로 시작하기"(Figma·템플릿·아이콘), "개발자로 시작하기"(green.900 카드, `$ npm install @superbase/react`).
4. Releases 타임라인 — `releases` 상위 3개 + "모든 릴리즈 보기 →"(→/releases).

### 목록 `/components`
- 헤더 eyebrow `COMPONENTS · 17`, 타이틀 "컴포넌트", 리드.
- 카테고리 필터 pill(`전체 17 · Actions · Inputs · Feedback · Navigation · Layout · Data · Foundation`) + 검색 입력(클라이언트 필터, 이름/blurb 매칭).
- 3열 카드 그리드: 각 카드 = 상단 미니 프리뷰(실제 컴포넌트 렌더) + 하단 이름·메타·status 뱃지. 카드 클릭 → 상세.
- 클라이언트 컴포넌트(필터 상태). 카탈로그는 `lib/catalog.ts`.

### 상세 `/components/<slug>` (route group `(reference)`)
- `(reference)/layout.tsx`: 좌측 그룹 사이드바(카테고리별 그룹 헤더 + 링크, 활성 강조) + 우측 `{children}`.
- 각 페이지: 타이틀 + status·버전 뱃지 + 리드, 탭(디자인/코드/접근성). 기존 `ComponentDoc` 콘텐츠 이관.
- **Button**: 대형 프리뷰 + 코드 스니펫, **Variants 표**(primary/secondary/outline/danger — 실제 컴포넌트 variant에 맞춤), **Do/Don't 카드**.

### 릴리즈 `/releases`
- `releases` 전체를 세로 타임라인으로. 각 항목 version + 제목 + 요약/하이라이트. 최신순.

## 데이터 모델

### `lib/catalog.ts`
```ts
export type Category = "Actions" | "Inputs" | "Feedback" | "Navigation" | "Layout" | "Data" | "Foundation";
export type Status = "stable" | "updated" | "new";
export interface CatalogItem { slug: string; name: string; category: Category; status: Status; blurb: string; }
export const categoryOrder: Category[] = ["Actions","Inputs","Feedback","Navigation","Layout","Data","Foundation"];
export const catalog: CatalogItem[] = [ /* 17개 */ ];
```
분류(실제 17종):
- Actions: Button
- Inputs: TextField, Checkbox, Radio, Switch
- Feedback: Toast, Modal, Spinner, Badge
- Navigation: Tabs, Header, BottomNavigation
- Layout: Stack, Card
- Data: Avatar
- Foundation: Text, Icon

status(실제 CHANGELOG 기준, **최신 릴리즈만 반영**):
- `new`: Header (0.5.0 신규)
- `updated`: BottomNavigation (0.5.0에서 기본 룩 변경)
- 그 외 15종: `stable`

`slug`는 기존 디렉터리명과 일치(avatar/badge/bottom-navigation/button/card/checkbox/header/icon/modal/radio/spinner/stack/switch/tabs/text/textfield/toast). `catalog.test.ts`가 슬러그↔`componentNav`/디렉터리 일치를 검증.

### `lib/releases.ts`
```ts
export interface Release { version: string; title: string; summary: string; }
export const releases: Release[] = [
  { version: "0.5.0", title: "Header 컴포넌트 + bar/floating variant 통일", summary: "Header compound 신규(onBack·알림 badge), Header·BottomNavigation에 bar/floating variant 도입." },
  { version: "0.4.0", title: "BottomNavigation + 웹 컴포넌트 하드닝", summary: "BottomNavigation 신규, 10개 컴포넌트 forwardRef·토큰화·focus-ring, Button/TextField/Card/Avatar/Tabs/Modal/Toast 심화." },
  { version: "0.3.0", title: "@superbase/icons + 웹 Icon", summary: "자체 큐레이션 아이콘 데이터 패키지와 이를 소비하는 웹 Icon 컴포넌트 추가." },
  { version: "0.2.0", title: "status 색 + 기본 폼 컴포넌트", summary: "토큰 status 색(info/success/warning/danger), Checkbox·Radio·Badge·Spinner 추가." },
];
```
날짜는 changeset 소스에 없어 표기하지 않음(버전 기준 타임라인). 필요 시 후속으로 git 커밋 날짜에서 보강.

## 스코프 아웃 (YAGNI)
- 검색의 퍼지 매칭·단축키. 단순 부분일치면 충분.
- 상세 16종의 Variants 표·Do/Don't(Button 외). 이후 점진.
- Figma/Changelog RSS 실제 링크(placeholder `#`).
- 릴리즈 날짜.

## 검증 (완료 기준)
1. `pnpm --filter @superbase/docs typecheck test` 통과(신규 catalog/releases 테스트 포함).
2. `pnpm --filter @superbase/docs build` — `/`, `/components`, `/components/button`, `/releases`, `/foundations` + 상세 16종 라우트 생성.
3. 육안: 홈 히어로·원칙·CTA·릴리즈, 목록 필터·검색·3열, 상세 사이드바·탭, Button Variants/Do·Don't, 그린 푸터.
4. 다크모드 토글 정상.
5. 상세 URL이 리뉴얼 전과 동일(`/components/<slug>`).

## 리스크 / 주의
- **route group 이동**: 17개 디렉터리 `git mv` 시 상대 import 경로(`../../../components/...`) 깊이가 한 단계 늘 수 있음 → 이동 후 typecheck로 확인·수정.
- **AppShell 제거**: `SideNav`·`AppShell` 참조를 모두 SiteHeader/상세 레이아웃으로 대체했는지 grep 확인. 관련 테스트(`SideNav.test.tsx`) 제거/이관.
- **홈 토큰 카드**: CSS 변수 읽기는 클라이언트에서(`useTokenValue` 패턴 재사용).
- 큰 스코프이므로 플랜에서 셸→홈→목록→상세→릴리즈 순으로 단계화.
