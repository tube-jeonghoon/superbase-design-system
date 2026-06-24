# @superbase/icons

## 0.4.0

### Minor Changes

- 2fa3da5: Header 컴포넌트 추가 및 bar/floating variant 통일

  - `Header` compound 컴포넌트 신규 (Web + React Native): `Header` / `HeaderBrand` / `HeaderTitle` / `HeaderActions` / `HeaderAction`. `onBack` 뒤로가기 버튼, `HeaderAction`의 `badge`로 빨간 알림 점 지원.
  - `bell` 아이콘 추가.
  - `Header`·`BottomNavigation`에 `variant="bar" | "floating"` 도입(기본값 `"bar"`). floating은 라운드 + 보더 + `shadow-sm`(은은한 그림자)로 통일.
  - ⚠️ BottomNavigation 기본 룩 변경: 기존 floating pill → `bar`(꽉 찬 바)가 기본. 기존 룩이 필요하면 `variant="floating"`을 명시하세요.

## 0.3.0

### Minor Changes

- 1d7edd4: Add BottomNavigation (compound: BottomNavigation + BottomNavigationItem) with a floating stadium-pill bar, brand-highlighted active item, and an optional back button (onBack) for nested screens, for web and React Native. Adds home/calendar/users/chat/arrow-left icons.

## 0.2.0

### Minor Changes

- c395e70: 자체 큐레이션 아이콘 데이터 패키지 @superbase/icons를 추가하고, 이를 소비하는 웹 Icon 컴포넌트를 @superbase/react에 추가한다.
