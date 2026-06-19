# 컴포넌트 배치 v0.2 — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨

## 1. 배경 & 목표

v1(Text/Button/TextField/Stack/Switch) 위에 폼·표현 컴포넌트 4종을 웹·모바일 동일 API로 추가하고, Badge가 필요로 하는 status 색 토큰을 보강한다.

### 범위
- 컴포넌트 4종 × (웹 `@superbase/react` + 모바일 `@superbase/react-native`): **Checkbox, RadioGroup+Radio, Badge, Spinner**
- 토큰 보강: status 색(info/success/warning/danger) — light/dark, 웹 CSS + RN native 양쪽
- 문서 사이트 Components 페이지에 쇼케이스 추가
- changeset으로 0.1.0 → 0.2.0(minor)

### 성공 기준
- 4종이 웹·모바일에서 동일 prop 의미로 동작
- 기존 패턴 준수(controlled, 토큰 참조, 웹은 data-속성+role, 테스트는 role/접근성/동작 중심)
- `pnpm turbo run typecheck test build` 전부 통과

## 2. 토큰 보강 (`@superbase/tokens`)

### primitive 추가 (`src/primitives.json`)
- `color.green.500` = `#00b26d`
- `color.yellow.500` = `#ffb020`

### semantic status 추가 (`src/semantic.light.json` / `src/semantic.dark.json`)
- `color.status.info` → `{color.blue.500}`
- `color.status.success` → `{color.green.500}`
- `color.status.warning` → `{color.yellow.500}`
- `color.status.danger` → `{color.red.500}`

(dark도 동일 매핑 — status 색은 테마 무관하게 동일 primitive를 가리킨다. 필요 시 추후 조정.)

→ 산출물: 웹 CSS `--color-status-info|success|warning|danger`, RN native `ColorStatusInfo|Success|Warning|Danger`.

## 3. 컴포넌트 API (웹·RN 공통 의미)

### Checkbox
- props: `checked: boolean`, `onChange?: (checked: boolean) => void`, `disabled?: boolean`, `label?: string`
- 웹: `<button role="checkbox" aria-checked={checked}>` + 선택적 `<label>`; data-checked. 클릭 → `onChange(!checked)`; disabled면 미호출.
- RN: `Pressable` + `accessibilityRole="checkbox"` + `accessibilityState={{ checked, disabled }}`; 체크 표시 View. onPress → onChange.

### RadioGroup + Radio
- RadioGroup props: `value: string`, `onChange?: (value: string) => void`, `children`
- Radio props: `value: string`, `label?: string`, `disabled?: boolean`
- React Context로 그룹의 현재 value/onChange 공유. Radio의 checked = (group.value === radio.value). 선택 시 group.onChange(value).
- 웹: 그룹 `role="radiogroup"`, 라디오 `role="radio" aria-checked`. RN: `accessibilityRole="radio"`.

### Badge
- props: `variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'` (기본 neutral), `children: ReactNode`(웹) / `string`(RN)
- 순수 표현. variant→색: neutral=gray, brand=brand.primary, success/warning/danger=status.*
- 웹: `span[data-variant]` + 토큰 배경/글자색. RN: `View`+`Text`.

### Spinner
- props: `size?: 'sm' | 'md' | 'lg'` (기본 md), `color?: string`(토큰 색 문자열, 기본 brand)
- 웹: 회전하는 CSS 보더 원, `role="status"` + `aria-label`. data-size.
- RN: 내장 `ActivityIndicator` 래핑(size sm/lg → small/large 매핑, md→기본; color 전달).

## 4. 파일 구조 (기존 패턴 그대로)

- 웹: `packages/react/src/<Name>/<Name>.tsx` + `<Name>.module.css` + `<Name>.test.tsx`; `src/index.ts`에 export 추가. (RadioGroup/Radio는 `src/Radio/` 하위에 함께, context 모듈 포함)
- RN: `packages/react-native/src/<Name>/<Name>.tsx` + `<Name>.test.tsx`; `src/index.ts`에 export.
- 토큰: 기존 `primitives.json` / `semantic.*.json` / config 수정, 스냅샷 갱신.
- 문서: `apps/docs/app/components/page.tsx`에 섹션 추가(인터랙티브는 이미 use client).

## 5. 테스트 전략

- **Checkbox**: role checkbox, toBeChecked, 클릭 토글, disabled 미호출.
- **Radio**: radiogroup 내 단일 선택(한 라디오 선택 시 그 value로 onChange), 선택 상태 반영.
- **Badge**: variant가 data-속성(웹)/렌더(RN)에 반영, children 렌더.
- **Spinner**: role="status"(웹) 또는 접근성 라벨 존재, size 반영.
- **토큰**: 빌드 산출물에 `--color-status-success` / `ColorStatusSuccess` 존재 스냅샷.

## 6. 분해 (플랜)

- **Plan 5**: 토큰 status 색 + 웹 4종 + 문서 쇼케이스 + changeset(web 패키지)
- **Plan 6**: RN 4종 + changeset(react-native 패키지)

각 플랜은 독립적으로 동작/배포 가능한 증분.

## 7. 범위 밖 (이번 배치 아님)

- Select/Dropdown, Modal, Toast (별도 배치)
- 아이콘 세트 (다음 작업)
- status 색의 테마별(dark) 별도 톤 — 일단 동일 primitive 사용
