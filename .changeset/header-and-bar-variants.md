---
"@superbase/icons": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

Header 컴포넌트 추가 및 bar/floating variant 통일

- `Header` compound 컴포넌트 신규 (Web + React Native): `Header` / `HeaderBrand` / `HeaderTitle` / `HeaderActions` / `HeaderAction`. `onBack` 뒤로가기 버튼, `HeaderAction`의 `badge`로 빨간 알림 점 지원.
- `bell` 아이콘 추가.
- `Header`·`BottomNavigation`에 `variant="bar" | "floating"` 도입(기본값 `"bar"`). floating은 라운드 + 보더 + `shadow-sm`(은은한 그림자)로 통일.
- ⚠️ BottomNavigation 기본 룩 변경: 기존 floating pill → `bar`(꽉 찬 바)가 기본. 기존 룩이 필요하면 `variant="floating"`을 명시하세요.
