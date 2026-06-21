# Phase 2 — 기존 컴포넌트 심화 설계 (Component Depth)

> 컴포넌트 고도화 로드맵 2단계. (1단계=파운데이션 하드닝 완료, 3단계=새 컴포넌트.) Phase 1 토큰/forwardRef/테마 위에서 기존 컴포넌트의 "1차원성"을 직접 해소한다.

## 목표 (Goal)

가장 많이 쓰이는 기존 컴포넌트(Button·TextField·Checkbox·Badge·Switch·Radio·Icon)에 실무에서 반복적으로 필요한 상태·슬롯·변형을 추가해 깊이를 만든다. 모든 추가는 **기존 prop API를 바꾸지 않고 추가만** 하며, 웹/RN 패리티와 문서를 함께 유지한다.

## 범위 (Scope) & 분해

3개 플랜으로 분해. 각 플랜은 **웹(`@superbase/react`) + RN(`@superbase/react-native`) + 문서(`apps/docs`)** 를 한 묶음으로 처리하고, 필요한 토큰은 `@superbase/tokens`에 추가한다(추가만, 하위호환). 순서: 2a → 2b → 2c.

- **Plan 2a — Button 심화**
- **Plan 2b — TextField 심화**
- **Plan 2c — 작은 컴포넌트(Checkbox/Badge/Switch/Radio) + Icon 스케일**

제외(이후): 새 컴포넌트(Select/Modal/Tooltip/Tabs 등)는 Phase 3. TextField `success` 상태는 제외(error + helperText로 충분 — YAGNI).

## 공통 원칙
- 기존 공개 prop/CSS 동작 불변 → 전부 **추가만**(non-breaking). 각 컴포넌트 웹/RN API 패리티 유지(prop 이름·의미 동일, 플랫폼 관용 차이만 — onPress/onClick 등).
- 슬롯(`startIcon`/`prefix` 등)은 `ReactNode`. 웹·RN 모두 `<Icon>` 등을 그대로 받는다.
- Phase 1 토큰을 적극 사용(아이콘 슬롯 gap=spacing, 트랜지션=duration/easing, 등). 신규 치수는 토큰으로만(하드코딩 금지).
- 각 플랜: TDD, 컴포넌트 문서 페이지에 새 예시(Web/RN 탭 둘 다) 추가, changeset(minor).

---

## Plan 2a — Button 심화

**신규 prop (web + RN, 둘 다 동일):**
- `loading?: boolean`
- `startIcon?: ReactNode` / `endIcon?: ReactNode`
- `fullWidth?: boolean`
- `variant`에 `"ghost" | "outline"` 추가 → `"primary" | "secondary" | "ghost" | "outline"`.

**동작:**
- **loading**: 스피너를 startIcon 위치에 표시(버튼 size에 맞춘 작은 스피너), 로딩 중 startIcon 숨김. 상호작용 차단(웹 `onClick`/RN `onPress` 가드 + `aria-busy=true`). 시각적으로 비활성(dim)처럼 흐려지지 않고 "작동 중"으로 읽히게(브랜드 색 유지). `disabled`와 별개 — `disabled`는 기존대로 dim.
- **아이콘 슬롯**: 레이아웃 `[startIcon] [label] [endIcon]`, 간격 `--spacing-2`. 웹 children=ReactNode(기존), RN children=string(라벨) + 슬롯은 ReactNode.
- **fullWidth**: 웹 `width:100%`(data-attr), RN `alignSelf:"stretch"`.
- **ghost**: 투명 배경 + brand 텍스트, hover 시 `--color-background-subtle`. **outline**: 투명 배경 + `--border-width-thin solid --color-border-default` 보더 + `--color-text-primary` 텍스트, hover 시 subtle. 두 variant 모두 size/loading/icon 슬롯과 조합 가능.

**구현 노트:**
- 웹: CSS Module에 `[data-variant="ghost"]`, `[data-variant="outline"]`, `[data-loading="true"]`, `[data-full-width="true"]` 추가. 아이콘 슬롯은 children 양옆에 `<span>` 래핑. loading은 컴포넌트가 `<Spinner size="sm">`를 렌더.
- RN: 새 variant 색/보더 분기, loading 시 `<Spinner>` 렌더 + `onPress` 가드, fullWidth 스타일. children(string)을 `<Text>`로 감싸고 슬롯을 양옆에 배치.
- 스피너 색: ghost/outline/secondary는 텍스트색, primary는 흰색.

**토큰:** 신규 없음(기존 spacing/border-width/color/duration로 충분).

**문서:** Button 페이지에 loading·아이콘 슬롯·fullWidth·ghost/outline 예시(Web/RN 탭).

---

## Plan 2b — TextField 심화

**신규 prop (web + RN):**
- `size?: "sm" | "md" | "lg"` (기본 `md`)
- `prefix?: ReactNode` / `suffix?: ReactNode` (입력칸 내부 좌/우 어도먼트)
- `clearable?: boolean`
- `helperText?: string`

**동작/구조:**
- **입력부 재구성**: 입력칸을 `control` 컨테이너(flex row)로 감싸고, 그 안에 `prefix` → `<input>/<TextInput>`(flex:1, 자체 보더 제거) → `clear 버튼`(있으면) → `suffix` 순. **보더·반경·높이·focus-ring을 `control`로 이동**(웹 `:focus-within`, RN 포커스 스타일). 기존 외형 유지(prefix/suffix 없으면 시각적으로 동일).
- **size**: `control` 높이를 size 토큰으로 — sm/md/lg. 폰트/패딩도 단계화.
- **clearable**: `clearable`이고 값이 있을 때 suffix 영역에 ✕ 버튼 → `onChange("")`(웹) / `onChangeText("")`(RN). a11y 라벨 "Clear".
- **helperText**: error가 없을 때 `control` 아래 보조 텍스트(secondary 색). error가 있으면 error 우선(기존 동작 유지).
- 비밀번호 토글은 전용 prop 없이 `suffix`로 조합(문서에 예시: 눈 아이콘 버튼 + `type` 토글).

**토큰 추가:** `--size-field-sm`(40), `--size-field-lg`(56). md는 기존 `--size-field`(48) 사용(=하위호환, 기존 토큰 유지). RN은 `size.fieldSm`(40)/`size.fieldLg`(56) 추가, `size.field`(48) 유지.

**구현 노트:**
- 웹: `.control` 클래스(border/radius/height/`:focus-within` ring), `.input`은 borderless flex:1. prefix/suffix/clear는 `<span>`/`<button>`. error/helper는 `control` 밖 아래.
- RN: `View`(control, row, border/height) 안에 prefix·`TextInput`(flex 1)·clear·suffix. helper/error는 아래 `Text`.

**문서:** TextField 페이지에 size·prefix/suffix·clearable·helperText·(비밀번호 토글 조합) 예시.

---

## Plan 2c — 작은 컴포넌트 + Icon 스케일

### Checkbox — indeterminate
- 신규 `indeterminate?: boolean`. true면 박스를 채우고 **대시(가로 막대)** 표시(체크마크 대신), 접근성 `aria-checked="mixed"`(웹) / RN `accessibilityState={{ checked: "mixed" }}` + `aria-checked="mixed"`. `indeterminate`가 `checked`보다 시각 우선. 클릭/onPress 동작은 기존대로(`onChange(!checked)`).
- 웹: `[data-indeterminate="true"] .check`를 대시(`width: calc(--size-control/2)`, `height: --border-width-medium`, 흰색) + 박스 brand 채움. RN: 대시 View.

### Badge — size · icon · dot
- 신규 `size?: "sm" | "md"`(기본 md=현재), `icon?: ReactNode`(라벨 앞), `dot?: boolean`(라벨 앞 작은 색 점).
- sm: 패딩/폰트 한 단계 작게. icon: 라벨 앞 gap `--spacing-1`. dot: variant 색의 작은 원(6px) 앞에.
- 웹 CSS `[data-size="sm"]` + 슬롯/dot 마크업. RN 동일.

### Switch / Radio — size
- 신규 `size?: "sm" | "md"`(기본 md=현재). sm은 치수 축소.
- Switch sm: `--size-switch-sm-{width,height,thumb}`(40/24/20), thumb 이동 `calc(width - thumb - 4px)`. Radio(및 Checkbox 박스) sm: `--size-control-sm`(16), 내부 마크 `calc(/2)`.
- 웹 `[data-size="sm"]` 분기. RN size별 치수.

### Icon — 명명 크기 스케일
- `size?: number | "xs" | "sm" | "md" | "lg"`. 명명값은 토큰 px 매핑(xs=12, sm=16, md=20, lg=24), number는 기존대로 raw. 기본 `"md"`(=20, 기존 기본과 동일값).
- 웹/RN 모두 `size` 해석 함수 추가.

**토큰 추가(2c):** `--size-icon-xs`(12), `--size-control-sm`(16), `--size-switch-sm-{width,height,thumb}`(40/24/20). RN 대응 `size.iconXs`, `size.controlSm`, `size.switchSm.{width,height,thumb}`.

**문서:** 각 컴포넌트 페이지에 indeterminate / Badge size·icon·dot / Switch·Radio size / Icon 명명 크기 예시.

---

## 테스트 전략
- 각 신규 동작을 단위 테스트로(웹·RN 각각, 기존 패턴): loading 시 클릭 차단·`aria-busy`, 아이콘 슬롯 렌더, fullWidth, 새 variant 클래스/스타일; TextField size/clearable(✕ 클릭 시 onChange("")) /helperText/prefix·suffix 렌더; Checkbox indeterminate aria-checked="mixed"; Badge size/icon/dot; Switch/Radio size; Icon 명명 크기 → 픽셀.
- 기존 테스트 전부 유지(추가만이라 무회귀). 전체 `pnpm turbo run typecheck test build` 통과. RN은 ThemeProvider 없이 라이트로 통과(하위호환).
- 토큰 추가 시 빌드 산출물 단언(웹 CSS 변수·RN 테마 키).

## 버전/호환성
- 플랜별 changeset: 2a `@superbase/react`+`@superbase/react-native` minor. 2b·2c는 토큰 추가 포함 시 `@superbase/tokens`도 minor. 전부 **추가만**이라 사용 측 breaking 없음.

## 해결된 결정
- Button 새 variant: `ghost` + `outline` 둘 다.
- TextField `success` 상태: 제외(error+helperText로 충분).
- Switch/Radio `size`(sm/md): 포함.
- 순서: 2a → 2b → 2c. 플랫폼: 웹+RN 함께(+문서).

## 후속(이 spec 밖)
- Phase 3: 새 컴포넌트(Select/Modal/Tooltip/Tabs/Card/Toast 등) — elevation/motion/z-index 토큰 활용.
- docs에 RN ThemeProvider 다크 토글 데모.
