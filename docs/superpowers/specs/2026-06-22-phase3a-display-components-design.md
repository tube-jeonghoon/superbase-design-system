# Phase 3a — 표시/레이아웃 컴포넌트 설계 (Card · Avatar · Tabs)

> 새 컴포넌트(Phase 3)의 첫 배치. portal/positioning이 필요 없는 표시·레이아웃 컴포넌트라 웹↔RN 이식이 깔끔하다. 오버레이 계열(Modal/Tooltip/Dropdown/Select/Toast)은 이후 별도 단계.

## 목표 (Goal)

`@superbase/react`·`@superbase/react-native`에 Card, Avatar, Tabs 3개 신규 컴포넌트를 추가한다. Phase 1 토큰(elevation/shadow 등)을 활용하고, 웹/RN API 패리티 + 문서를 유지한다.

## 범위 (Scope) & 분해

2개 플랜(각 웹+RN+문서, 필요 토큰은 `@superbase/tokens` 추가):
- **Plan 3a-1 — Card + Avatar** (간단; avatar 토큰 추가)
- **Plan 3a-2 — Tabs** (compound + a11y/키보드)

제외(이후): Modal/Dialog, Tooltip, Dropdown/Menu, Select, Toast(오버레이 단계). Card.Header/Footer 컴파운드, AvatarGroup — YAGNI(children 조합으로 충분).

## 공통 원칙
- 전부 신규 추가(기존 불변). 웹/RN 컴포넌트 API 패리티(prop 이름·의미 동일, 플랫폼 관용 차이만). 각 컴포넌트는 `index.ts` export + 문서 사이드바 항목 + 페이지(Web/RN 탭 예시).
- 치수/색/그림자는 토큰으로(하드코딩 금지). forwardRef 적용.
- TDD, 플랜별 changeset(minor).

---

## Plan 3a-1 — Card + Avatar

### Card (web + RN)
**Props:**
- `elevation?: "none" | "sm" | "md" | "lg"` (기본 `"sm"`) — Phase 1 shadow 토큰.
- `bordered?: boolean` (기본 false)
- `padding?: 0 | 1 | 2 | 3 | 4 | 6 | 8` (SpacingScale, 기본 4)
- `children: ReactNode`; 웹 `className?`, RN `style?`.

**동작/구현:**
- 컨테이너: 배경 `background.default`, 라운드 `radius.lg`, 패딩 = spacing[padding], `bordered`면 `border-width.thin` solid `border.default`, elevation은 shadow 토큰(`none`=그림자 없음).
- 웹: `<div>` + CSS Module(`data-elevation`/`data-bordered`), `box-shadow: var(--shadow-{e})`, 패딩은 인라인 `var(--spacing-{n})`. forwardRef→div.
- RN: `<View>` + `t.shadow[elevation]` 스프레드(none이면 미적용), `t.spacing[padding]`, 보더/배경/라운드. forwardRef→View.

### Avatar (web + RN)
**Props:**
- `src?: string`, `name?: string`(이니셜 + 접근성 라벨), `size?: "sm" | "md" | "lg"`(기본 md), `shape?: "circle" | "square"`(기본 circle). 웹 `className?`, RN `style?`.

**폴백 규칙:**
- `src`가 있고 로드 성공 → 이미지. `src` 없음 또는 로드 실패(onError) → **name 이니셜**(공백 분리 첫 2단어 첫 글자 대문자, 예 "Jeong Hoon"→"JH", 단어 1개면 첫 글자). name도 없으면 **user 아이콘**(`<Icon name="user">`).
- 폴백 배경 `background.subtle`, 텍스트 `text.secondary`. 글자 크기는 사이즈에 비례.
- 접근성: 이미지 `alt`/이니셜 컨테이너 `aria-label`/RN `accessibilityLabel` = name(없으면 아이콘은 장식 처리).

**구현:**
- 사이즈 토큰 `size-avatar-{sm,md,lg}`(32/40/56) 신규. shape: circle=`radius.full`, square=`radius.md`.
- 웹: `src` && !failed면 `<img src onError={()=>setFailed(true)} alt={name}>`, 아니면 `<span>` 이니셜/아이콘. 로컬 state로 실패 추적.
- RN: `<Image source={{uri:src}} onError={()=>setFailed(true)}>`, 아니면 `<View>` + `<Text>`(이니셜) 또는 `<Icon name="user">`.

**토큰 추가(3a-1):** `--size-avatar-sm`(32)/`-md`(40)/`-lg`(56), RN `t.size.avatar.{sm,md,lg}`.

**문서:** Card·Avatar 페이지 추가(사이드바 항목 + Web/RN 탭 예시: Card elevation/bordered/padding, Avatar src/이니셜 폴백/size/shape).

---

## Plan 3a-2 — Tabs (compound)

**컴파운드 컴포넌트:** `Tabs`(context provider) → `TabList` → `Tab` → `TabPanel`. (docs 내부 `Tabs` 프리미티브와 별개 — 이건 `@superbase/*` 공개 컴포넌트.)

**API (web + RN 동일):**
- `<Tabs value onChange aria-label>` — `value: string`, `onChange?: (value: string) => void`, `children`. context로 `{value, onChange}` 제공.
- `<TabList>` — 탭 묶음(가로). 웹 `role="tablist"` + 화살표 키 내비. RN row View.
- `<Tab value label>` — `value: string`, `label: ReactNode`(웹)/`string`(RN). 클릭/onPress → `onChange(value)`. 활성 시 강조(밑줄 brand). 웹 `role="tab"` + `aria-selected` + roving `tabIndex` + `aria-controls`. RN `accessibilityRole`/`accessibilityState={{selected}}`.
- `<TabPanel value children>` — 활성 value일 때만 표시. 웹 `role="tabpanel"` + `aria-labelledby`. RN View(비활성은 미렌더).

**a11y 와이어링(웹):** `Tab` id=`tab-${value}`, `TabPanel` id=`panel-${value}`, `aria-controls`/`aria-labelledby`로 연결. **키보드(웹):** `TabList`의 `onKeyDown`에서 ArrowLeft/Right(+Home/End)로 활성 탭 이동(roving tabindex). RN은 키보드 없음(모바일).

**스타일:** 탭은 패딩 + 하단 2px(=`border-width-medium`) 투명 보더, 활성 탭은 brand 보더 + brand 텍스트, 비활성은 secondary 텍스트. 트랜지션은 motion 토큰. focus-ring은 `:focus-visible`.

**토큰:** 신규 없음(spacing/color/border/motion 토큰 사용).

**구현 파일:** `packages/react/src/Tabs/{Tabs.tsx,TabList.tsx,Tab.tsx,TabPanel.tsx,TabsContext.ts,Tabs.module.css}`, `packages/react-native/src/Tabs/{Tabs.tsx,TabList.tsx,Tab.tsx,TabPanel.tsx,TabsContext.ts}`. 각 index.ts에서 4개 컴포넌트 + 타입 export.

**문서:** Tabs 페이지 추가(사이드바 + Web/RN 탭 예시: 기본 사용 compound, 키보드 내비 설명).

---

## 테스트 전략
- **Card**: children 렌더, elevation/bordered data-attr(웹), forwardRef. RN 렌더 + ref.
- **Avatar**: src 있을 때 이미지, src 없을 때 이니셜(name→initials), onError 시 폴백, name 없을 때 아이콘, size/shape.
- **Tabs**: 탭 클릭 시 onChange 호출 + 해당 패널 표시, 비활성 패널 미표시, a11y 역할(role tab/tablist/tabpanel + aria-selected), (웹) ArrowRight로 활성 탭 이동, forwardRef(가능 범위).
- 기존 테스트 무회귀, 전체 `pnpm turbo run typecheck test build` 통과. RN은 ThemeProvider 없이 라이트로 통과. 토큰 추가 시 빌드 산출물 단언.

## 버전/호환성
- 3a-1: `@superbase/tokens`(avatar 토큰)+`@superbase/react`+`@superbase/react-native` minor. 3a-2: `@superbase/react`+`@superbase/react-native` minor. 전부 추가만이라 breaking 없음.

## 해결된 결정
- Tabs: compound API(`Tabs/TabList/Tab/TabPanel`).
- Card: 헤더/푸터 컴파운드 없음(children 조합).
- Avatar: 단일만(AvatarGroup 없음).
- 시작 배치: Card·Avatar·Tabs. 플랫폼: 웹+RN 함께(+문서).

## 후속(이 spec 밖)
- Phase 3 오버레이 단계: 오버레이 인프라(웹 portal+focus-trap, RN Modal 래퍼) + Modal/Dialog → Tooltip/Dropdown/Menu → Select → Toast. 별도 brainstorming→spec→plan.
