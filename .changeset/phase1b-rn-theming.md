---
"@superbase/react-native": minor
---

런타임 다크테마 도입: `ThemeProvider`/`useTheme`(기본값 라이트 — Provider 없이도 기존처럼 동작하므로 하위호환) export. 10개 컴포넌트를 테마 기반으로 전환하고 forwardRef 지원 추가. 하드코딩 치수를 토큰(size/border-width/opacity)으로 교체, TextField error·Switch 트랙 색을 semantic 토큰으로, Spinner 기본 a11y 라벨을 영문("Loading")으로 변경.
