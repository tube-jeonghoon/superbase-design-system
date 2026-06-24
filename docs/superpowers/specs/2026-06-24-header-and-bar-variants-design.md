# Header 컴포넌트 + bar/floating variant 통일 설계

**작성일:** 2026-06-24
**상태:** 설계 승인 대기

## 목표

앱 상단 헤더(브랜드 아이콘 + 타이틀/서브타이틀 + 우측 액션)를 cross-platform compound 컴포넌트 `Header`로 신규 제공한다. 동시에 `Header`와 기존 `BottomNavigation`에 동일한 `variant="bar" | "floating"` API를 도입해, 두 컴포넌트가 "꽉 찬 바"와 "라운드 플로팅" 두 룩을 일관된 방식으로 지원하도록 한다.

## 배경 / 동기

- 사용자가 직접 만든 앱 헤더(초록 원형 브랜드 아이콘 + `오늘의대회` / `Smash today` + 알림 벨(빨간 dot) + 설정 기어)를 재사용 가능한 컴포넌트로 만들고자 한다.
- 헤더는 화면 최상단 고정형(꽉 찬 바)이 표준이지만, 이 디자인 시스템은 BottomNavigation을 플로팅 pill로 제공 중이라 "플로팅" 룩도 한 세트로 필요하다.
- 두 룩을 모두 지원하는 표준 방식인 `variant` prop을 도입하고, Header와 BottomNavigation에서 **이름·의미를 통일**한다.

## 스코프

**포함**
1. `bell`(알림 벨) 아이콘을 `@superbase/icons`에 신규 추가
2. `Header` compound 컴포넌트 (Web + React Native)
3. `BottomNavigation`에 `variant` prop 추가 + 기본 룩 변경 (Web + React Native)
4. docs: Header 페이지 신규, BottomNavigation 페이지에 variant 데모 반영, 사이드바 nav 엔트리 추가
5. changeset

**제외 (YAGNI / 후속 여지)**
- 타이틀 가운데 정렬 모드 (양 variant 모두 좌측 정렬 고정)
- 배지의 숫자 카운트 (빨간 dot만 지원)
- sticky/scroll 동작, safe-area inset 처리 (소비자 책임)
- 고정 높이 토큰 (패딩 기반 높이로 충분)

## 공통: variant 규약

두 컴포넌트가 동일한 prop을 가진다.

```ts
variant?: "bar" | "floating"; // 기본값 "bar"
```

| variant | 컨테이너 스타일 | 비고 |
|---|---|---|
| `bar` (기본) | 꽉 찬 바, 직각(radius 없음), 그림자 없음, **경계 보더 한 줄** | Header는 하단 보더, BottomNavigation은 상단 보더 |
| `floating` | radius-lg, **보더 + `shadow-sm`(은은)**, 바깥 여백(margin) | Header는 카드형, BottomNavigation은 radius-full pill |

- `variant`는 **root 컨테이너의 컨테이너 스타일(배경/보더/radius/그림자/여백)만** 분기한다. 내부 레이아웃·자식 구조는 variant와 무관하게 동일하다.
- floating 그림자는 두 컴포넌트 공통으로 `shadow-sm` + `border-width-thin` 보더로 통일한다. (BottomNavigation 기존 `shadow-lg` → `shadow-sm`+보더로 변경)
- floating 바깥 여백은 `spacing-3`을 기본 사용한다. (스페이싱 스케일에 5/7 없음 — 0/1/2/3/4/6/8만 사용)

## 1. 아이콘: `bell` 추가

**파일**
- 수정: `packages/icons/src/index.ts` — `iconPaths`에 `bell` 추가 (24×24 viewBox, stroke 기반)
- 수정: `packages/icons/src/index.test.ts` — 개수 23 → 24, `bell` 포함 검증

**경로(초안, 구현 시 시각 검증 후 확정):**
```
bell: "M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13zM10 20a2 2 0 0 0 4 0"
```
- `settings`(기어), `arrow-left`(뒤로가기)는 기존 아이콘 재사용.
- 구현 시 qlmanage/CDP로 렌더 시각 검증(기존 아이콘 추가 절차와 동일).

## 2. Header 컴포넌트

### 2.1 Public API

```tsx
<Header variant="bar" onBack={goBack} aria-label="앱 헤더">
  <HeaderBrand>
    <Avatar … />                         {/* 또는 Icon/이미지 등 임의 노드 */}
  </HeaderBrand>
  <HeaderTitle title="오늘의대회" subtitle="Smash today" />
  <HeaderActions>
    <HeaderAction icon={<Icon name="bell" />} label="알림" badge onClick={openAlerts} />
    <HeaderAction icon={<Icon name="settings" />} label="설정" onClick={openSettings} />
  </HeaderActions>
</Header>
```

### 2.2 컴파운드 파트

| 파트 | 역할 / props |
|---|---|
| `Header` (root) | 가로 레이아웃 컨테이너. `variant?: "bar"\|"floating"`(기본 "bar"), `onBack?: () => void`, `children`. `onBack` 있으면 **좌측 맨 앞**에 ← 버튼(`arrow-left`) 자동 렌더. presence 컨텍스트 Provider. Web `<header>`, RN `<View>`. |
| `HeaderBrand` | 좌측 브랜드 비주얼 슬롯. `children`만. `flex-shrink: 0`. 선택적(없어도 됨). |
| `HeaderTitle` | `title: ReactNode`(필수) + `subtitle?: ReactNode`. 세로 텍스트 스택. `flex: 1`로 남는 공간 차지 → 액션을 우측으로 밂. |
| `HeaderActions` | 우측 액션 묶음 컨테이너. `children`. `flex-shrink: 0`, 가로 gap. |
| `HeaderAction` | 단일 아이콘 버튼. `icon: ReactNode`(필수), `label: string`(필수, a11y), `badge?: boolean`(빨간 dot), 기타 버튼 핸들러(`onClick`/`onPress`). |

### 2.3 컴포지션 가드 (context)

- `HeaderContext = createContext<HeaderContextValue | null>(null)` — presence 마커 용도(상태 없음, `{}`).
- `useHeaderContext()`는 컨텍스트가 `null`이면 throw (`"Header 컴파운드 컴포넌트는 <Header> 내부에서 사용해야 합니다"`).
- `HeaderBrand` / `HeaderTitle` / `HeaderActions` / `HeaderAction`은 렌더 시 `useHeaderContext()`를 호출해 잘못된 사용을 차단한다. (Tabs/Modal/BottomNavigation 가드 패턴과 동일)

### 2.4 비주얼 / 토큰

**root 공통:** `display:flex; align-items:center; gap: spacing-3; padding: spacing-3 spacing-4; background: color-background-default;`

**variant 분기 (root에만):**
- `bar`: `border-bottom: border-width-thin solid color-border-default;` (radius/shadow/margin 없음)
- `floating`: `border-radius: radius-lg; border: border-width-thin solid color-border-default; box-shadow: shadow-sm; margin: spacing-3;`

**자식:**
- `HeaderBrand`: `flex-shrink:0; display:inline-flex; align-items:center;`
- `HeaderTitle`: `flex:1; min-width:0; display:flex; flex-direction:column;`
  - title 텍스트: `font-size-body` + `font-weight-bold` + `color-text-primary`, `line-height-body`, 한 줄 말줄임(`overflow:hidden; text-overflow:ellipsis; white-space:nowrap`)
  - subtitle: `font-size-caption` + `color-text-secondary`, `line-height-caption`, 한 줄 말줄임
- `HeaderActions`: `flex-shrink:0; display:flex; align-items:center; gap: spacing-1;`
- `HeaderAction`: `size-field-sm` 정사각, `border-radius: radius-full`, `background:transparent`, `color: color-text-primary`, hover 시 `background: color-background-subtle`. `position:relative`(badge 기준).
  - `badge`: 우상단 절대배치 작은 dot. `background: color-status-danger`(또는 `color-text-danger`/error 토큰), 지름 ~`spacing-2`, `border-radius: radius-full`, 헤더 배경색 보더로 분리감.
- `back` 버튼: `HeaderAction`과 동일 사이즈/모양, `arrow-left` 아이콘, `aria-label="뒤로"`.

> 정확한 danger 색 토큰명은 구현 시 `packages/tokens` 빌드 산출물에서 확인해 사용한다(예: `color-status-danger` 또는 `color-text-error`). 없으면 토큰 추가가 아니라 기존 error/danger 계열 토큰을 사용한다.

### 2.5 접근성

- Web root: `<header>` (banner 랜드마크). `aria-label`은 prop으로 덮어쓰기 가능, 기본 `"앱 헤더"`.
- `HeaderAction` / back 버튼: `<button type="button" aria-label={label}>`.
- badge dot은 시각 표식 전용(`aria-hidden`); 알림 상태는 `label`에 의미를 담는 것을 권장(소비자가 `label="알림 (새 알림 있음)"` 식으로). 컴포넌트는 dot만 그린다.
- RN: root `<View accessibilityRole 미지정(배너 역할 없음)>` + `accessibilityLabel`. 액션은 `<Pressable accessibilityRole="button" accessibilityLabel={label}>`.

### 2.6 파일 구조

**Web — `packages/react/src/Header/`**
- `HeaderContext.ts` — 컨텍스트 + `useHeaderContext` 가드
- `Header.tsx` — root (`forwardRef<HTMLElement>`)
- `HeaderBrand.tsx`
- `HeaderTitle.tsx`
- `HeaderActions.tsx`
- `HeaderAction.tsx`
- `Header.module.css`
- `index.ts` — 위 5개 컴포넌트 + 타입 export
- `packages/react/src/index.ts` — Header 파트 re-export 추가

**React Native — `packages/react-native/src/Header/`**
- `HeaderContext.ts`
- `Header.tsx` — root (`forwardRef<ElementRef<typeof View>>`, `extends ViewProps`로 `style`/rest 패스스루)
- `HeaderBrand.tsx`
- `HeaderTitle.tsx`
- `HeaderActions.tsx`
- `HeaderAction.tsx`
- `index.ts`
- `packages/react-native/src/index.ts` — re-export 추가

(웹/네이티브 컨텍스트·가드는 각 패키지에 독립 정의 — 기존 컴포넌트들과 동일 구조)

## 3. BottomNavigation 리팩터링

### 3.1 변경 내용

- `BottomNavigationProps`에 `variant?: "bar" | "floating"` 추가, **기본값 `"bar"`**.
- ⚠️ **기본 룩 변경**: 기존에는 항상 floating pill이었음 → 기본이 `bar`(꽉 찬 바)로 바뀜. `variant="floating"`을 명시해야 기존 pill 룩이 된다.
- floating 룩의 그림자를 `shadow-lg` → `shadow-sm` + 보더로 변경(공통 규약 준수).

### 3.2 비주얼 분기

**root 공통(기존 유지):** `display:flex; align-items:center; gap: spacing-1; padding: spacing-2 spacing-3; background: color-background-default;`

- `bar`: `border-top: border-width-thin solid color-border-default;` (radius/shadow/margin 없음) — 화면 하단 고정형
- `floating`: `border-radius: radius-full; border: border-width-thin solid color-border-default; box-shadow: shadow-sm;` (바깥 여백은 소비자/데모에서 부여)

### 3.3 파일

**Web — `packages/react/src/BottomNavigation/`**
- 수정: `BottomNavigation.tsx` — `variant` prop 추가, root className에 `styles[variant]` 결합
- 수정: `BottomNavigation.module.css` — 현재 `.bar`를 공통 `.root` + 분기 `.bar`/`.floating`으로 재구성

**React Native — `packages/react-native/src/BottomNavigation/`**
- 수정: `BottomNavigation.tsx` — `variant` prop 추가, root style 배열에서 variant 분기

기존 컴파운드 자식(`BottomNavigationItem`), `onBack`/divider 동작은 변경 없음.

## 4. docs

- 신규: `apps/docs/app/components/header/page.tsx` — Web/RN 탭, 예제: ① 기본(bar) ② 플로팅(floating) ③ 뒤로가기(onBack) ④ 배지(badge). BottomNavigation 페이지 구조 답습.
- 수정: `apps/docs/app/components/bottom-navigation/page.tsx` — 기본(bar) / 플로팅(floating) 예제 추가, 데모가 두 variant를 모두 보여주도록.
- 수정: `apps/docs/components/docs/componentNav.ts` — `header` 엔트리 추가 (적절한 그룹/순서).
- 수정: `apps/docs/components/docs/componentNav.test.ts` — 항목 수 16 → 17, header 엔트리 검증.

## 5. changeset

`.changeset/header-and-bar-variants.md`:
- `@superbase/icons`: minor (bell 추가)
- `@superbase/react`: minor (Header 신규 + BottomNavigation variant)
- `@superbase/react-native`: minor (Header 신규 + BottomNavigation variant)

BottomNavigation 기본 룩 변경은 0.x 단계의 동작 변경이므로 minor로 처리하고, changeset 본문에 "BottomNavigation 기본 룩이 floating pill → bar로 변경됨. 기존 룩은 `variant=\"floating\"`" 명시.

## 6. 테스트 전략

**icons (`packages/icons`)**
- 아이콘 개수 24, `bell` 포함, path 비어있지 않음.

**react Header (`packages/react/src/Header/Header.test.tsx`)**
- title/subtitle 렌더링.
- `onBack` 있을 때 ← 버튼 렌더 + 클릭 시 콜백 호출, 없을 때 미렌더.
- `HeaderAction` 클릭 시 핸들러 호출, `aria-label` 노출.
- `badge` 있을 때 dot 렌더, 없을 때 미렌더.
- `variant` 기본 "bar" 클래스 적용 / `variant="floating"` 클래스 적용.
- 각 자식을 `<Header>` 밖에서 렌더 시 throw.

**react-native Header (`packages/react-native/src/Header/Header.test.tsx`)**
- title/subtitle 렌더, back/action press 핸들러 호출, accessibilityLabel 노출, 자식 밖 사용 throw. (jsdom/RN 테스트 환경은 기존 RN 컴포넌트 테스트 방식 답습)

**BottomNavigation**
- 기존 테스트 모두 통과 유지.
- `variant` 기본 "bar" 적용 / `variant="floating"` 적용 검증 추가(웹: 클래스, RN: 스타일).

**docs**
- `componentNav.test.ts` 항목 수 17, header 엔트리 검증.

**전체**
- `pnpm typecheck`(특히 RN 인라인 스타일 타입), `pnpm test`, docs 빌드 통과.
- 시각 검증: CDP로 Header 두 variant + 뒤로가기 + 배지, BottomNavigation 두 variant 렌더 확인. bell 아이콘 qlmanage 확인.

## 7. 구현 순서

1. `bell` 아이콘 추가 + 검증
2. Header — Web (context/가드 → root/variant → 자식들 → CSS → export → 테스트)
3. Header — React Native (미러링 + 테스트)
4. BottomNavigation variant — Web (CSS 재구성 + prop + 테스트)
5. BottomNavigation variant — React Native (prop + 테스트)
6. docs (Header 페이지, BottomNavigation variant 데모, nav 엔트리+테스트)
7. changeset + 전체 typecheck/test/빌드/시각 검증

## 미해결/구현 시 확정 항목

- `bell` 아이콘 path 미세 조정(시각 검증 후 확정).
- danger/error 계열 색 토큰의 정확한 이름(빌드 산출물에서 확인해 badge 색에 사용; 신규 토큰 추가 없이 기존 토큰 사용).
- title/subtitle 폰트 토큰 미세 조정(기존 Text 스케일과 정합).
