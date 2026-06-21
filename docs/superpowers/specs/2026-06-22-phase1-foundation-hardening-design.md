# Phase 1 — 파운데이션 하드닝 설계 (Foundation Hardening)

> 컴포넌트 고도화 3단계 로드맵의 1단계. (2단계=기존 컴포넌트 심화, 3단계=새 컴포넌트.) 각 단계는 자체 spec→plan→구현 사이클.

## 목표 (Goal)

디자인 시스템이 "얇고 1차원적"인 근본 원인 — **빠진 파운데이션 토큰**과 **토큰을 우회하는 하드코딩** — 을 제거한다. 이후 단계(심화·신규 컴포넌트)가 하드코딩 없이 토큰 위에서 일관되게 쌓이도록 기반을 다진다. 동시에 `forwardRef`와 RN 런타임 다크테마를 도입해 컴포넌트 조합성과 테마 전환을 가능케 한다.

## 범위 (Scope)

포함:
1. **신규 토큰 8종** — shadow/elevation, motion(duration+easing), focus-ring, opacity, border-width, z-index, line-height, letter-spacing.
2. **component-size 토큰** — 하드코딩된 치수(버튼 높이, 컨트롤 박스, 필드 높이, 스위치 치수, 아이콘 크기)를 토큰화.
3. **하드코딩 → 토큰 교체** — 웹·RN 전 컴포넌트의 매직넘버(치수·트랜지션·opacity·border-width)를 신규 토큰으로 치환.
4. **`forwardRef` 전면 적용** — 웹·RN 10개 컴포넌트 모두 ref 전달.
5. **RN 런타임 다크테마** — `lightTheme`/`darkTheme` dual export + `ThemeProvider` + `useTheme()` 훅. RN 컴포넌트를 정적 토큰 import에서 훅 기반으로 전환.
6. **문서·테스트** — Foundations 페이지에 신규 토큰 시각화 추가, 토큰 빌드/컴포넌트 테스트 보강.

제외(이후 단계):
- 새 컴포넌트(Select/Modal/Tooltip/Tabs 등) — Phase 3.
- 컴포넌트 기능 심화(Button loading/아이콘 슬롯, TextField size/slot, Checkbox indeterminate 등) — Phase 2. **단, Phase 1은 이들이 의존할 토큰을 미리 만든다.**
- 웹 런타임 테마 API 변경 — 웹은 기존 CSS 변수 + `[data-theme]` 방식 유지(이미 동작).

## 아키텍처 (Architecture)

### 단일 소스 → 플랫폼별 빌드
토큰 단일 소스(JSON) → Style Dictionary → 두 출력:
- **웹**: `dist/web/variables.css` — `:root`(라이트) + `[data-theme="dark"]`(다크) CSS 변수. 신규 토큰만 추가, 기존 구조 유지.
- **RN**: `dist/native/` — 기존 flat 상수 export는 유지(하위호환)하되, 신규로 `lightTheme`/`darkTheme` 테마 객체를 export.

### 토큰 소스 파일 구성
- 기존: `primitives.json`, `semantic.light.json`, `semantic.dark.json`.
- 신규 추가:
  - `primitives.json`에 `borderWidth`, `opacity`, `lineHeight`, `letterSpacing`, `duration`, `easing`, `zIndex` 원시 스케일 추가.
  - 신규 `shadow.json` — 플랫폼별 합성(composite) 그림자.
  - 신규 `sizing.json` — component-size 토큰.
  - `semantic.light.json`/`semantic.dark.json`에 `focusRing` 의미 토큰 추가(brand 기반).

### 신규 Style Dictionary 커스텀 처리
- **shadow(합성)**: 웹은 `box-shadow` 문자열, RN은 `{shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation}` 객체로 emit하는 커스텀 포맷/트랜스폼 필요.
- **easing**: 웹은 `cubic-bezier(...)` 문자열, RN은 베지어 제어점 4-튜플 `[x1,y1,x2,y2]`(앱이 `Easing.bezier(...e)`로 사용)로 emit.
- **focus-ring/z-index**: 웹 전용 — RN 테마 객체에는 미포함.

### RN 테마 객체 형태
```
Theme = {
  color: { text, background, brand, border, status },   // 라이트/다크 다름
  spacing, radius, fontSize, fontWeight,                  // 공유
  lineHeight, letterSpacing,                              // 공유
  shadow: { sm, md, lg, xl },                             // 공유 (RN 그림자 객체)
  motion: { duration:{fast,base,slow}, easing:{standard,decelerate,accelerate} }, // 공유
  opacity: { disabled, pressed },                         // 공유
  borderWidth: { thin, medium },                          // 공유
  size: { control, button:{sm,md,lg}, field, switch:{width,height,thumb}, icon:{sm,md,lg} }, // 공유
}
```
`lightTheme`/`darkTheme`는 `color`만 다르고 나머지는 동일 공유.

### ThemeProvider / useTheme — 하위호환(non-breaking)
- `ThemeContext`의 **기본값은 `lightTheme`**. 따라서 `ThemeProvider` 없이 `useTheme()`를 호출하면 라이트 테마를 반환 → 기존 RN 앱은 Provider 없이도 그대로 동작(라이트). **breaking 아님.**
- `ThemeProvider` props: `colorScheme?: "light" | "dark" | "system"`(기본 `"light"`). `"system"`이면 RN `Appearance.getColorScheme()` + `Appearance` 변경 리스너로 활성 테마 결정.
- `useTheme(): Theme` — 활성 테마 객체 반환.
- 선택적 헬퍼는 도입하지 않음(YAGNI). 컴포넌트는 `const t = useTheme()` 후 함수 본문에서 스타일 구성(StyleSheet.create 대신 인라인 또는 메모이즈된 스타일).

## 신규 토큰 값 (구체)

### Shadow/Elevation
| 토큰 | 웹 box-shadow | RN 객체 (elevation은 Android) |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,.06)` | `{color:#000, offset:{0,1}, opacity:.06, radius:2, elevation:1}` |
| `shadow-md` | `0 4px 8px rgba(0,0,0,.08)` | `{#000, {0,4}, .08, 8, elevation:4}` |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,.12)` | `{#000, {0,8}, .12, 24, elevation:8}` |
| `shadow-xl` | `0 16px 48px rgba(0,0,0,.16)` | `{#000, {0,16}, .16, 48, elevation:16}` |

다크 모드: Phase 1은 동일 값 사용(다크 그림자 튜닝은 후속 백로그로 기록).

### Motion
- `duration-fast` 120ms · `duration-base` 200ms · `duration-slow` 320ms (RN: 숫자 120/200/320)
- `easing-standard` `cubic-bezier(.2,0,0,1)` · `easing-decelerate` `cubic-bezier(0,0,0,1)` · `easing-accelerate` `cubic-bezier(.3,0,1,1)` (RN: 제어점 튜플)

### Focus-ring (웹 전용)
- `focus-ring-color` `rgba(49,130,246,.4)` (brand-primary 40%) · `focus-ring-width` `2px` · `focus-ring-offset` `2px`

### Opacity
- `opacity-disabled` `0.4` · `opacity-pressed` `0.85`

### Border-width
- `border-width-thin` `1px` · `border-width-medium` `2px`

### Z-index (웹 전용)
- `z-dropdown` 1000 · `z-overlay` 1200 · `z-modal` 1300 · `z-popover` 1400 · `z-toast` 1500

### Line-height (unitless 비율)
- `line-height-caption` 1.4 · `line-height-body` 1.5 · `line-height-title` 1.4 · `line-height-display` 1.3
- RN: 비율 export, RN `Text`가 `fontSize * ratio`로 px 계산.

### Letter-spacing
- `letter-spacing-tight` `-0.02em` (display/title) · `letter-spacing-normal` `0`
- RN: tight는 음수 px(대략 fontSize*-0.02) 또는 0; RN Text는 절대 px이므로 변형별 계산값 사용.

### Component-size
- `size-control` 20 (checkbox/radio 박스 + 내부 마크 비율 유지)
- `size-button-sm` 36 · `size-button-md` 44 · `size-button-lg` 52
- `size-field` 48
- `size-switch-width` 52 · `size-switch-height` 32 · `size-switch-thumb` 28
- `size-icon-sm` 16 · `size-icon-md` 20 · `size-icon-lg` 24

## 컴포넌트 리팩터 요구사항

### 공통 (웹 + RN, 10개)
- 모든 컴포넌트 `forwardRef`로 ref 전달. 적절한 ref 타입(웹: 해당 HTML 요소; RN: 해당 RN 컴포넌트 인스턴스).
- 기존 공개 prop API는 유지(추가만, breaking 없음).

### 웹
- 하드코딩 치수/값 → `var(--…)` 교체:
  - Button 높이(36/44/52) → `--size-button-*`; 트랜지션 `0.15s` → `--duration-fast`+`--easing-standard`.
  - Checkbox/Radio 박스(20, 내부 10) → `--size-control` 기반; border `2px` → `--border-width-medium`.
  - TextField 높이(48) → `--size-field`; border `1px` → `--border-width-thin`.
  - Switch 치수(52/32/28) → `--size-switch-*`.
  - Spinner 치수 → `--size-icon-*` 정합, 회전 `0.6s`는 애니메이션 고유값으로 유지(또는 `--duration` 미적용 명시).
  - disabled `opacity:0.4` → `--opacity-disabled`.
- `:focus-visible` focus-ring를 인터랙티브 컴포넌트(Button/Switch/Checkbox/Radio/TextField)에 일관 적용 — `--focus-ring-*` 사용.
- Spinner 기본 `aria-label`의 하드코딩 한국어 `"로딩 중"` 제거 → 영문 기본값 `"Loading"`(또는 필수 prop화는 breaking이므로 기본값 영문으로).

### RN
- 정적 토큰 import(`ColorTextPrimary` 등) → `const t = useTheme()` 훅 기반으로 전환. 스타일은 테마 값으로 함수 내 구성.
- 하드코딩 치수 → `t.size.*` 토큰:
  - Button 높이(36/44/52)→`t.size.button`; Checkbox/Radio(20/10/border 2)→`t.size.control`+`t.borderWidth.medium`; TextField(48/border 1)→`t.size.field`+`t.borderWidth.thin`; Badge 패딩/`fontWeight 500`(→`t.fontWeight.medium`); Switch 치수→`t.size.switch`.
- disabled `opacity:0.4` → `t.opacity.disabled`; pressed 피드백 → `t.opacity.pressed`.
- TextField error 색이 primitive(`ColorRed500`)를 직접 쓰던 것 → semantic `t.color.status.danger`로 교체.
- Text에 `lineHeight`(= fontSize×ratio), display/title `letterSpacing` 적용.

## 문서 (apps/docs)
- **Foundations 페이지**에 신규 토큰 섹션/탭 추가: Elevation(그림자 박스 4단계), Motion(duration·easing 설명), Opacity, Border-width, Line-height 표. 기존 `useTokenValue`/`Swatch` 패턴 재사용, 신규 토큰은 라이브 값 표시.
- RN 다크테마 사용법(ThemeProvider 감싸기)을 Getting Started 또는 해당 컴포넌트 노트에 짧게 문서화.

## 테스트 전략
- **tokens**: 빌드 산출물 스냅샷/단언 — 웹 CSS에 신규 변수 존재, RN `lightTheme`/`darkTheme` 객체 형태·키 존재, shadow/easing 커스텀 포맷이 플랫폼별로 올바른 모양.
- **웹 컴포넌트**: 기존 테스트 전부 유지. 추가 — ref 전달(`ref.current` 인스턴스 확인), focus-ring 클래스/스타일 적용, Spinner 기본 aria-label 영문.
- **RN 컴포넌트**: `ThemeProvider` 아래 렌더 + Provider 없이도 렌더(기본 라이트) 둘 다 통과. `colorScheme="dark"`로 감쌌을 때 색이 다크로 바뀌는지(react-native-web 헤드리스) 검증. ref 전달 검증.
- 전체 `pnpm turbo run typecheck test build` 통과.

## 버전/호환성
- `@superbase/tokens`·`@superbase/react`·`@superbase/react-native` 모두 **minor** bump(changeset).
- RN `useTheme` 도입은 기본값 라이트로 **하위호환**(Provider 불필요). 신규 export(`ThemeProvider`, `useTheme`, `lightTheme`, `darkTheme`)는 순수 추가.
- 웹·RN 모두 기존 공개 prop API 불변 → 사용 측 breaking 없음.

## 해결된 결정
- RN 테마: **Context + `useTheme()`**(헬퍼 없이), 기본값 라이트로 하위호환.
- 웹 테마: 기존 CSS 변수 방식 유지.
- focus-ring·z-index는 웹 전용(RN 테마 객체 제외).
- 토큰 값은 위 표대로 시작(리뷰에서 조정 가능).

## 후속 백로그(이 spec 밖)
- 다크 모드 전용 그림자 튜닝.
- RNW 0.19/React19 react-dom legacy export warning 정리.
- Phase 2(심화)·Phase 3(신규 컴포넌트) 각각 별도 spec.
