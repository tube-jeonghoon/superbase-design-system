# Foundations 페이지 리디자인 — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨

## 1. 배경 & 목표

현재 `/foundations` 페이지는 평면적인 `<section>` + `<Text>` 구성이고, 색 스와치는 토큰 var 이름만 보여줄 뿐 실제 값이 없다. 컴포넌트 페이지(ComponentDoc/Example)와 같은 디자인 언어로 다듬고, 각 토큰을 **실제 값과 함께** 보여준다.

### 성공 기준
- 페이지가 ComponentDoc 틀(제목 + 리드)과 일관된 섹션 구성을 갖는다.
- 색 스와치가 **해석된 hex 값**을 표시하고, **다크 모드 전환 시 값이 함께 갱신**된다.
- 색이 semantic 그룹(Text / Brand & Background / Status)으로 묶인다.
- 타이포는 실제 크기 specimen, 간격은 막대+값, 반경은 박스+값으로 보여준다.
- `pnpm turbo run typecheck test build` 통과.

### 범위
- `apps/docs`만 변경. 라이브러리 패키지 변경 없음.

## 2. 토큰 값 읽기 (라이브, 단일 소스)

토큰 값을 docs에 하드코딩하지 않고 **런타임에 CSS 변수에서 읽는다**(단일 소스 유지).

- **`useTokenValue(cssVar): string`** (클라이언트 훅): `getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()`를 반환. `document.documentElement`의 `data-theme` 속성 변경을 `MutationObserver`로 구독해, 다크 모드 토글 시 색 값이 다시 읽혀 갱신된다.

## 3. 컴포넌트 (apps/docs/components/foundations/)

- **`useTokenValue.ts`** — 위 훅.
- **`Swatch.tsx`** (재설계, 클라이언트) — props `{ name, cssVar }`. 색 칩(배경 `var(cssVar)`) + 이름 + `useTokenValue(cssVar)`로 읽은 hex(대문자). 카드 형태.
- **`TokenValue.tsx`** (클라이언트) — props `{ cssVar }`. `useTokenValue`로 읽은 값을 모노스페이스로 표시(타이포/간격/반경 라벨에 재사용).
- Foundations 페이지(`app/foundations/page.tsx`, `"use client"`)는 `ComponentDoc` + 섹션으로 구성하고 위 컴포넌트를 사용한다.

## 4. 페이지 구성

`ComponentDoc title="Foundations" lead="...토큰...실제 값과 함께"` 안에:

- **Colors**: semantic 그룹별(`group` 필드)로 나눠 `Swatch` 카드 그리드. 그룹 라벨(소문자 대문자) 표시.
- **Typography**: `fontSizes`를 각 variant의 실제 크기로 렌더한 specimen + `이름 · <TokenValue>` 라벨.
- **Spacing**: `spacingScale`을 막대(width `var(--spacing-N)`) + `spacing-N · <TokenValue>` 라벨.
- **Radius**: `radii`를 박스(border-radius `var(cssVar)`) + `이름 · <TokenValue>` 라벨.

## 5. 데이터 (`apps/docs/lib/tokens.ts`)

- `DisplayToken`(색)에 `group: "text" | "brand" | "status"` 필드 추가. 기존 12개 색에 그룹 지정.
  - text: text.primary/secondary/disabled
  - brand: background.default/subtle, brand.primary/pressed, border.default
  - status: status.info/success/warning/danger
- `spacingScale`/`fontSizes`/`radii`는 그대로(값은 `TokenValue`가 런타임에 읽음). fontSizes/radii는 `{ name, cssVar }`, spacing은 숫자 스케일 + `--spacing-N` 규칙.

## 6. 파일 구조

```
apps/docs/
├─ components/foundations/
│  ├─ useTokenValue.ts (+ useTokenValue.test.tsx)
│  ├─ Swatch.tsx (+ Swatch.test.tsx)   # 기존 components/Swatch.tsx 대체·이동
│  └─ TokenValue.tsx
├─ lib/tokens.ts (수정: 색에 group 추가)
└─ app/foundations/page.tsx (재작성)
```

> 기존 `apps/docs/components/Swatch.tsx`는 `components/foundations/Swatch.tsx`로 대체된다(평면 버전 제거).

## 7. 테스트 전략

- **useTokenValue**: 테스트에서 `document.documentElement.style.setProperty("--test", "#abc123")` 후 훅을 쓰는 컴포넌트를 렌더 → "#abc123"이 표시되는지 확인(jsdom은 inline-set CSS 변수를 getComputedStyle로 읽을 수 있음). data-theme 변경 시 갱신도 inline 값 변경으로 검증.
- **Swatch**: 이름이 렌더되고, 칩 요소의 배경에 `var(cssVar)`가 들어감.
- **Foundations 데이터**: 색 12개가 모두 셋 그룹 중 하나에 속함(각 색의 `group`이 유효).
- **페이지**: `next build` 성공 + `/foundations` 라우트 생성으로 검증(개별 렌더 테스트는 프리미티브 테스트로 대체).

## 8. 범위 밖

- 토큰 값 클립보드 복사(추후 고려).
- primitive 색 팔레트(blue/gray scale) 전체 노출 — 지금은 semantic만.
- 그림자(shadow) 토큰 — 아직 없음.
