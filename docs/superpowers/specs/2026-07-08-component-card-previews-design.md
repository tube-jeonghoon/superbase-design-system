# 컴포넌트 목록 카드 미리보기 설계

**작성일:** 2026-07-08
**대상:** `apps/docs` — 컴포넌트 목록 페이지(`/components`)

## 목표

컴포넌트 목록 그리드(`/components`)의 각 카드가 지금은 회색 박스에 **컴포넌트 이름 텍스트만** 표시한다. 이를 각 컴포넌트의 **실제 축소 렌더링(대표 인스턴스 1개)**으로 교체해, 목록에서 바로 컴포넌트가 어떻게 생겼는지 보이게 한다.

## 배경 / 현재 상태

- `apps/docs/app/components/page.tsx`의 카드 미리보기 영역(`line 60-62`)은 텍스트 플레이스홀더다:
  ```tsx
  <div style={{ height: 120, ... }}>{c.name}</div>
  ```
- 상세 페이지(`/components/button` 등)는 이미 `<Example>`로 라이브 미리보기를 보여준다. 이 작업은 **목록 카드**만 대상으로 한다.
- `@superbase/react`는 17개 컴포넌트를 모두 웹으로 export한다(확인 완료). 단 **Modal**은 포털/오버레이, **Toast**는 `useToast` 명령형 API, **Header·BottomNavigation**은 전체 너비 바라서 120px 카드에 실물을 그대로 못 넣는다.

## 설계 결정 (확정)

1. **작업 범위:** 목록 카드 미리보기만. 상세 페이지는 손대지 않는다.
2. **미리보기 밀도:** 카드당 **대표 인스턴스 1개**. variant 군집 나열 안 함 → 그리드가 깔끔하고 일관됨.
3. **렌더 불가 컴포넌트(Modal/Toast/Header/BottomNavigation):** 실물 대신 **대표 미니어처**(라이브러리 토큰만 쓴 정적 재현)를 넣는다.
4. **미리보기 위치:** 전용 프리뷰 레지스트리 파일 하나(`slug → ReactNode` 맵). `catalog.ts`(순수 데이터·테스트 대상)는 오염시키지 않는다.

## 아키텍처

### 새 파일

**1. `apps/docs/components/site/PreviewFrame.tsx`** — 미리보기 박스 표준 래퍼
- 역할: 모든 카드의 120px 미리보기 영역을 통일한다.
- 스타일: `height: 120`, 중앙 정렬(flex center), `overflow: hidden`, `background: var(--color-background-subtle)`.
- **`inert` 속성이 필수**다. 카드 전체가 `<a href>` 링크인데, 미리보기 안에는 Tab·Checkbox·Switch·Button 같은 `<button tabIndex=0>`이 들어간다. `pointer-events: none`은 클릭만 막고 **키보드 탭 순서에는 그대로 남아** 카드 17개가 탭 순서를 오염시키고, 스크린리더에도 중복 노출된다. `inert`는 포인터·탭 순서·접근성 트리에서 한 번에 제거한다(React 19가 `inert` boolean prop을 지원하고, 이 레포는 React 19 + `@types/react` 19를 쓴다). CSS의 `pointer-events: none`은 이중 안전장치로 함께 둔다.
- props: `{ children: ReactNode }`.

**2. `apps/docs/components/site/previews.tsx`** — 프리뷰 레지스트리
- 최상단 `"use client"`.
- `export const previews: Record<string, ReactNode>` — 키는 catalog slug 17개.
- 실제 렌더 컴포넌트는 `@superbase/react`에서 import. 미니어처 4개는 같은 파일 안의 작은 로컬 컴포넌트(`ToastMini`/`ModalMini`/`HeaderMini`/`BottomNavMini`)로 정의한다 — "카드가 무엇을 보여주는가"가 한 파일에 모여 응집도가 높다.

**CSS 모듈 2개** — `components/site/`의 기존 관례(`SiteHeader.module.css`)를 따른다.
- `PreviewFrame.module.css`
- `previews.module.css` (미니어처 4종 + 폭 제한 wrapper + Stack 데코 박스)

### 수정 파일

**`apps/docs/app/components/page.tsx`** — `line 60-62` 교체:
```tsx
// 변경 전
<div style={{ height: 120, background: "var(--color-background-subtle)", ... }}>
  {c.name}
</div>
// 변경 후
<PreviewFrame>{previews[c.slug]}</PreviewFrame>
```
`PreviewFrame`, `previews` import 추가. 기존 카드 링크/뱃지/blurb 구조는 그대로 둔다.

## 17개 미리보기 명세

각 항목은 **대표 인스턴스 1개**. 실제 렌더는 `@superbase/react` 웹 컴포넌트를 쓴다.

### 실제 렌더링 (13개)

**중요:** `Checkbox`·`Switch`·`RadioGroup`·`Tabs`·`TextField`는 모두 **controlled 컴포넌트**다(`defaultChecked`/`defaultValue` 같은 uncontrolled prop이 없다). 미리보기는 정적이므로 `checked`/`value`를 고정값으로 넘기고 핸들러는 생략하거나 no-op으로 둔다. `inert` 때문에 상호작용 자체가 불가능하다. 라벨은 children이 아니라 `label` prop으로 넘긴다(`Checkbox`, `Radio`).

| slug | 미리보기 |
|---|---|
| `button` | `<Button variant="primary">확인</Button>` |
| `textfield` | `<TextField placeholder="이메일" value="" onChange={noop} />` (폭 220px wrapper) |
| `checkbox` | `<Checkbox checked label="동의합니다" />` |
| `radio` | `<RadioGroup value="a"><Radio value="a" label="선택됨" /></RadioGroup>` |
| `switch` | `<Switch checked aria-label="미리보기" />` |
| `spinner` | `<Spinner size="lg" />` |
| `badge` | `<Badge variant="brand">NEW</Badge>` |
| `tabs` | `<Tabs value="design">` + `TabList` + `Tab` 2개(첫 탭 활성) |
| `card` | `<Card elevation="sm" padding={3}><Text variant="caption" weight="medium">Card</Text></Card>` |
| `avatar` | `<Avatar name="Jeong Hoon" />` → 이니셜 `JH` |
| `text` | `<Text variant="title" weight="bold">Aa 가나다</Text>` |
| `icon` | `<Icon name="star" size={32} />` (명명 `lg`=24는 카드에서 작아 32px 사용) |
| `stack` | `<Stack direction="row" gap={2}>` 안에 토큰 색 박스 3개 |

> 사용 가능한 아이콘 이름(24종): `arrow-left bell calendar chat check chevron-{up,down,left,right} close error heart home info menu minus plus search settings star success user users warning`

### 대표 미니어처 (4개)

라이브러리를 import하지 않고, 시맨틱 토큰(`--color-*`, `--radius-*`, `--spacing-*`)만으로 그 컴포넌트를 연상시키는 작은 정적 재현을 만든다.

| slug | 미니어처 |
|---|---|
| `toast` | 그림자 있는 작은 알림 pill — 왼쪽 성공 아이콘 점 + "저장되었습니다" 텍스트, `background: var(--color-background-default)`, `box-shadow`, `border-radius: var(--radius-md)` |
| `modal` | 미니 다이얼로그 카드 — 반투명 백드롭 위에 작은 흰 카드(제목 줄 + 버튼 2개 실루엣), `border-radius: var(--radius-lg)` |
| `header` | 상단 바 — 왼쪽 제목 텍스트 + 오른쪽 `bell` 아이콘, 하단 보더, 카드 폭 채움 |
| `bottom-navigation` | 하단 탭 바 — `home`/`search`/`user` 아이콘 3개 균등 배치, 첫 항목 `brand.primary` 강조, 상단 보더 |

미니어처는 실제 토큰을 쓰므로 색·모서리가 실물과 일치하고 다크 모드도 자동 반영된다.

## 다크 모드

모든 미리보기(실물 + 미니어처)가 시맨틱 토큰만 사용하므로 다크 모드 토글 시 자동으로 따라간다. 별도 처리 없음.

## 테스트

**`apps/docs/components/site/previews.test.tsx`** — 커버리지 테스트
- `catalog`의 모든 slug가 `previews`에 키로 존재하는지 검증(누락/오타 방지).
- `previews`의 모든 키가 catalog에 존재하는지 검증(불필요 항목 방지).
- 즉 `Object.keys(previews)` 집합 == `catalog.map(c => c.slug)` 집합.

```ts
import { describe, it, expect } from "vitest";
import { catalog } from "../../lib/catalog";
import { previews } from "./previews";

describe("previews", () => {
  it("catalog 모든 slug에 미리보기가 있고, 남는 미리보기가 없다", () => {
    expect(new Set(Object.keys(previews))).toEqual(new Set(catalog.map((c) => c.slug)));
  });
});
```

개별 컴포넌트 렌더 스냅샷은 만들지 않는다(YAGNI — 상세 페이지가 이미 실렌더를 검증하고, 미리보기는 시각적 표현이라 스냅샷 유지비가 큼).

기존 테스트 스위트(`pnpm --filter @superbase/docs test`)와 `typecheck`가 모두 통과해야 한다.

## 범위 밖 (하지 않음)

- 상세 페이지 예제 보강
- 카드 hover 애니메이션/인터랙션 추가
- 미리보기 개별 스냅샷 테스트
- `catalog.ts` 구조 변경
