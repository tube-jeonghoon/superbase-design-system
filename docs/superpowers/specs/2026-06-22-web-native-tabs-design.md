# 컴포넌트 페이지 Web/Native 분리 — 설계 문서

> 작성일: 2026-06-22
> 상태: 승인됨

## 배경 & 목표
컴포넌트 페이지(`/components/<slug>`)가 현재 웹(`@superbase/react`)만 라이브로 보여준다. 각 페이지에 **Web / React Native 탭**을 두어 두 플랫폼을 **모두 라이브로** 비교한다. RN은 `react-native-web`으로 웹에서 렌더한다. apps/docs만 변경(라이브러리 패키지 불변).

### 성공 기준
- 각 컴포넌트 페이지에 `Web` / `React Native` 탭이 있고, 각 탭이 해당 플랫폼 컴포넌트를 **라이브로** 렌더 + 그 플랫폼 코드 스니펫을 보여준다.
- `pnpm turbo run typecheck test build` 통과, `next build`에서 RN 프리뷰가 정상 렌더(라우트 빌드).
- 결정: **라이브 프리뷰(react-native-web)** + Web/Native 탭. **POC(Button)부터** 검증 후 확장.

## 아키텍처

### 1. react-native-web 인프라 (docs)
- 의존성 추가: `react-native-web`, `react-native-svg`(Icon RN용), `@superbase/react-native`.
- `apps/docs/next.config.ts`:
  - `react-native` → `react-native-web` 별칭 (webpack `resolve.alias['react-native$']`, turbopack `resolveAlias`). `$`/정확매칭으로 `react-native-svg`·`react-native-web`은 제외.
  - `transpilePackages`에 `@superbase/react-native`, `react-native-web`, `react-native-svg`, `@superbase/icons` 추가(기존 react·tokens 유지).
- RNW가 SSR/빌드에서 깨지면 폴백: RN 프리뷰를 클라이언트 전용으로(`next/dynamic` `ssr:false` 또는 mount-gated) 렌더.

### 2. 탭 컴포넌트 재사용
- 기존 `Tabs`(Foundations에서 만든)를 **`apps/docs/components/docs/Tabs.tsx`로 이동**(이제 docs 공용 프리미티브). Foundations 페이지·테스트의 import 경로 갱신.
- 각 컴포넌트 페이지: `ComponentDoc` 아래 `<Tabs items=[{web}, {native}]>`.
  - Web 탭: 기존 `@superbase/react` 라이브 `Example`들(웹 코드).
  - React Native 탭: `@superbase/react-native` 라이브 `Example`들(RN 코드 — `onPress`/`onChangeText` 등 관용).

### 3. Example 재사용
RN도 동일 `Example`(설명+프리뷰+CodeBlock). children=RN 컴포넌트(RNW 렌더), code=RN 스니펫. 새 프리미티브 없음.

## 파일 구조 (Plan A)

```
apps/docs/
├─ package.json (수정: react-native-web, react-native-svg, @superbase/react-native 추가)
├─ next.config.ts (수정: 별칭 + transpilePackages)
├─ components/docs/Tabs.tsx (+ .module.css, .test.tsx)   # foundations/에서 이동
├─ components/foundations/ (Tabs import 경로만 갱신: page, 등)
└─ app/components/button/page.tsx (재작성: Web/Native 탭)
```

## 분해 (플랜)
- **Plan A (POC + 인프라)**: react-native-web 설정 + Tabs를 docs/로 이동 + **Button 페이지** Web/Native 탭 변환 + 빌드 검증. (Button은 svg 미사용이라 깔끔한 첫 검증)
- **Plan B**: 나머지 9개 페이지(Text·TextField·Stack·Switch·Checkbox·Radio·Badge·Spinner·**Icon**) 변환. Icon은 react-native-svg-on-web 스트레스 테스트.

## 테스트 전략
- `Tabs` 이동 후 기존 테스트 유지(경로 갱신).
- Button 페이지: `next build` 성공 + `/components/button` 라우트 빌드(웹+RN 프리뷰 SSR/SSG 통과).
- RNW 빌드 이슈 시 클라이언트 전용 폴백 적용(설계 1번).

## 범위 밖
- 실시간 코드 편집, 모바일 프레임(목업 디바이스) 안에 RN 프리뷰 표시(추후 고려).
- RN 다크 테마 토글(현재 RN은 light 토큰 고정).
