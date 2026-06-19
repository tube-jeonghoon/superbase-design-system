# 문서 사이트 리디자인 — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨

## 1. 배경 & 목표

현재 `apps/docs`의 `/components`는 9개 컴포넌트를 한 페이지에 평면적인 섹션으로 나열(제목+예시)해 "그냥 순서대로 뿌리는" 느낌이다. TDS 문서처럼 **각 컴포넌트가 사이드바의 개별 항목(서브 페이지)으로 분리**되고, 각 페이지가 **섹션별로 설명글 + 프리뷰 + 코드 스니펫**으로 잘 소개되도록 리디자인한다.

### 성공 기준
- 사이드바 "Components" 그룹이 9개 컴포넌트를 개별 항목으로 나열하고, 각 항목이 자기 페이지로 이동한다.
- 각 컴포넌트 페이지가 제목 + 리드 + 1개 이상의 예시 섹션(설명·프리뷰·코드)으로 구성된다.
- 코드 스니펫이 문법 하이라이팅 + 복사 버튼을 갖고, 프리뷰와 약간 간격을 둔다.
- `pnpm turbo run typecheck test build`가 전부 통과하고 모든 컴포넌트 라우트가 빌드된다.

### 범위
- 대상: `apps/docs` (문서 사이트). 라이브러리 패키지(react/react-native/tokens)는 변경 없음.
- 실시간 코드 편집(react-live 류)은 범위 밖 — 정적 코드 + 복사.

## 2. 라우팅 & 네비게이션

- **`/components`** — 컴포넌트 개요(인덱스): 9개 카드 그리드, 각 카드가 해당 컴포넌트 페이지로 링크.
- **`/components/<slug>`** — 컴포넌트별 페이지. slug 9종: `badge, button, checkbox, radio, spinner, stack, switch, text, textfield`.
- **AppShell 사이드바** — 상단 항목: Getting Started, Foundations. 그 아래 "Components" 그룹(펼침 표시)이 9개 컴포넌트 항목을 나열한다. 현재 경로와 일치하는 항목을 활성 스타일로 표시(클라이언트에서 `usePathname`).

## 3. 재사용 문서 프리미티브 (`apps/docs/components/docs/`)

각 파일은 하나의 명확한 책임을 갖는다.

- **`Code.tsx`** — 인라인 코드 칩. prop 이름 등을 prose 안에 표시. `<Code>variant</Code>`.
- **`CodeBlock.tsx`** — `prism-react-renderer`로 코드 문자열을 하이라이팅한 다크 코드블록 + 복사 버튼(클립보드). props: `code: string`, `language?` (기본 "tsx").
- **`Example.tsx`** — 예시 섹션 1개. props: `title?: string`, `description?: ReactNode`, `code: string`, `children`(라이브 프리뷰). 렌더: (title h3) → description → **프리뷰 캔버스**(children) → 약간의 간격 → **CodeBlock(code)**.
- **`ComponentDoc.tsx`** — 페이지 상단 틀. props: `title: string`, `lead: string`, `children`(Example들). 렌더: h1 + 리드 문단 + children.
- **`componentNav.ts`** — 컴포넌트 목록 데이터(slug, label) 단일 소스. AppShell 사이드바와 `/components` 인덱스가 공유.

> CodeBlock과 Example, 페이지들은 인터랙티브(복사 버튼/라이브 컴포넌트)이므로 클라이언트 컴포넌트(`"use client"`)다. ComponentDoc/Code는 표현용이라 서버여도 되지만, 페이지가 `"use client"`이면 함께 클라이언트로 묶인다.

## 4. 컴포넌트 페이지 내용

각 페이지는 실제 `@superbase/react` 컴포넌트를 라이브 렌더하고, 그 사용 코드를 문자열로 `CodeBlock`에 전달한다. 페이지별 예시 섹션(예):
- **Button**: 기본 사용(variant), 크기(size), 비활성(disabled)
- **Badge**: variant 5종
- **Checkbox**: 기본(checked/onChange), 라벨, 비활성
- **Radio**: RadioGroup 단일 선택
- **Spinner**: 크기 3종
- **Stack**: direction/gap
- **Switch**: 기본 토글
- **Text**: variant·weight·color
- **TextField**: 라벨, 에러, 입력

(각 페이지 최소 1개, 보통 2~3개 섹션. 인터랙티브 데모는 페이지 내부 state로 제어.)

## 5. 파일 구조

```
apps/docs/
├─ components/
│  ├─ AppShell.tsx (수정 — Components 그룹 네비 + usePathname 활성화)
│  └─ docs/
│     ├─ Code.tsx
│     ├─ CodeBlock.tsx
│     ├─ Example.tsx
│     ├─ ComponentDoc.tsx
│     ├─ componentNav.ts
│     └─ *.test.tsx (CodeBlock/Example/nav 테스트)
└─ app/components/
   ├─ page.tsx (수정 — 인덱스 그리드)
   ├─ badge/page.tsx
   ├─ button/page.tsx
   ├─ checkbox/page.tsx
   ├─ radio/page.tsx
   ├─ spinner/page.tsx
   ├─ stack/page.tsx
   ├─ switch/page.tsx
   ├─ text/page.tsx
   └─ textfield/page.tsx
```

> 기존 `apps/docs/app/components/page.tsx`(평면 쇼케이스)는 인덱스 그리드로 대체된다.

## 6. 라이브러리

- **`prism-react-renderer`** (apps/docs devDependency, 경량, 빌드 설정 불필요)로 코드 하이라이팅. 다크 테마 프리셋 + 토큰 색과 어울리는 커스텀 팔레트.
- 추가 런타임 의존성 없음(복사는 `navigator.clipboard`).

## 7. 테스트 전략

- **CodeBlock**: 코드 텍스트가 렌더되고, 복사 버튼이 존재하며 클릭 시 `navigator.clipboard.writeText`가 그 코드로 호출됨(클립보드 mock).
- **Example**: 프리뷰(children)와 코드 문자열이 모두 렌더됨.
- **componentNav / 사이드바**: 네비가 9개 컴포넌트 항목을 모두 나열함(데이터 길이 9 + 렌더).
- **페이지들**: `next build` 성공 + 9개 `/components/<slug>` 라우트 생성으로 검증(개별 렌더 테스트는 생략, 프리미티브 테스트로 대체).

## 8. 분해 (플랜)

- **Plan 7**: 인프라 — `prism-react-renderer` 설치 + 프리미티브(Code/CodeBlock/Example/ComponentDoc/componentNav) + AppShell 그룹 네비 + `/components` 인덱스 + **Button 페이지(레퍼런스)**. (동작하는 증분: 인덱스 + Button 페이지 + 네비)
- **Plan 8**: 나머지 8개 컴포넌트 페이지(Badge/Checkbox/Radio/Spinner/Stack/Switch/Text/TextField).

## 9. 범위 밖

- 실시간 편집 가능한 예시(react-live)
- 자동 props 테이블(타입에서 생성) — 추후
- 검색, 버전 토글 등 문서 부가기능
