# @superbase/react-native

## 0.5.0

### Minor Changes

- 2fa3da5: Header 컴포넌트 추가 및 bar/floating variant 통일

  - `Header` compound 컴포넌트 신규 (Web + React Native): `Header` / `HeaderBrand` / `HeaderTitle` / `HeaderActions` / `HeaderAction`. `onBack` 뒤로가기 버튼, `HeaderAction`의 `badge`로 빨간 알림 점 지원.
  - `bell` 아이콘 추가.
  - `Header`·`BottomNavigation`에 `variant="bar" | "floating"` 도입(기본값 `"bar"`). floating은 라운드 + 보더 + `shadow-sm`(은은한 그림자)로 통일.
  - ⚠️ BottomNavigation 기본 룩 변경: 기존 floating pill → `bar`(꽉 찬 바)가 기본. 기존 룩이 필요하면 `variant="floating"`을 명시하세요.

### Patch Changes

- Updated dependencies [2fa3da5]
  - @superbase/icons@0.4.0

## 0.4.0

### Minor Changes

- 1d7edd4: Add BottomNavigation (compound: BottomNavigation + BottomNavigationItem) with a floating stadium-pill bar, brand-highlighted active item, and an optional back button (onBack) for nested screens, for web and React Native. Adds home/calendar/users/chat/arrow-left icons.
- 1ea13eb: 런타임 다크테마 도입: `ThemeProvider`/`useTheme`(기본값 라이트 — Provider 없이도 기존처럼 동작하므로 하위호환) export. 10개 컴포넌트를 테마 기반으로 전환하고 forwardRef 지원 추가. 하드코딩 치수를 토큰(size/border-width/opacity)으로 교체, TextField error·Switch 트랙 색을 semantic 토큰으로, Spinner 기본 a11y 라벨을 영문("Loading")으로 변경.
- c2d4bc3: Button 심화: `loading`(내부 Spinner + 상호작용 차단 + aria-busy), `startIcon`/`endIcon` 슬롯, `fullWidth`, 그리고 `ghost`·`outline` variant 추가. 전부 추가만이라 하위호환.
- cb2ee46: TextField 심화: `size`(sm/md/lg), `prefix`/`suffix` 슬롯, `clearable`(✕ 버튼), `helperText` 추가. 입력부를 control 컨테이너로 재구성(포커스링은 컨테이너 `:focus-within`). 신규 토큰 `--size-field-sm`(40)/`--size-field-lg`(56) 추가. 전부 추가만이라 하위호환.
- 060275e: 작은 컴포넌트 심화 + Icon 스케일: Checkbox `indeterminate`(aria-checked=mixed + 대시), Badge `size`(sm/md)·`icon`·`dot`, Switch·Radio `size`(sm/md), Icon `size`에 명명값(xs/sm/md/lg) 허용(number도 유지). 신규 토큰 `--size-icon-xs`(12)/`--size-control-sm`(16)/`--size-switch-sm-*`(40/24/20). 전부 추가만이라 하위호환.
- a7f4a2c: 신규 컴포넌트: Card(elevation none/sm/md/lg + bordered + padding, Phase 1 shadow 토큰 활용)와 Avatar(이미지 + name 이니셜 → user 아이콘 폴백, size sm/md/lg, shape circle/square). 신규 토큰 `--size-avatar-{sm,md,lg}`(32/40/56). 둘 다 web/RN 패리티 + forwardRef.
- 6cf1a85: 신규 컴포넌트: 컴파운드 Tabs(`Tabs`/`TabList`/`Tab`/`TabPanel`). 웹은 ARIA(tablist/tab/tabpanel) + 화살표 키 내비(roving tabindex) + focus-ring, RN은 Pressable 탭 + accessibilityRole. 활성 탭 하단 brand 보더, 활성 패널만 렌더.
- 6a58df5: Add overlay infrastructure (Portal/focus-trap/scroll-lock/escape) and Modal/Dialog (compound: Modal + ModalHeader/ModalBody/ModalFooter) for web and React Native. New tokens: background scrim color and modal width sizes (sm/md/lg).
- 3a456ff: Add Toast notifications with an imperative ToastProvider/useToast API (show/success/error/warning/info/dismiss) for web and React Native. Auto-dismiss, stacking, action button, and bottom-center placement. New token: toast width size.

### Patch Changes

- Updated dependencies [1d7edd4]
- Updated dependencies [a3d1ec6]
- Updated dependencies [cb2ee46]
- Updated dependencies [060275e]
- Updated dependencies [a7f4a2c]
- Updated dependencies [6a58df5]
- Updated dependencies [3a456ff]
  - @superbase/icons@0.3.0
  - @superbase/tokens@0.3.0

## 0.3.0

### Minor Changes

- e4ec077: react-native-svg 기반 Icon 컴포넌트를 추가한다(@superbase/icons 패스 데이터 소비, 웹과 동일 API).

### Patch Changes

- Updated dependencies [c395e70]
  - @superbase/icons@0.2.0

## 0.2.0

### Minor Changes

- 0850414: 모바일 컴포넌트 Checkbox, RadioGroup+Radio, Badge, Spinner를 추가한다(웹과 동일 API).

### Patch Changes

- Updated dependencies [7438298]
  - @superbase/tokens@0.2.0
