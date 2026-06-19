# Superbase Design System

[TDS(Toss Design System)](https://tossmini-docs.toss.im/tds-mobile/)의 미니멀·클린한 감성을 참고한 **크로스플랫폼 디자인 시스템**. 디자인 토큰을 단일 소스에서 정의해 웹·모바일에 일관되게 적용한다.

## 패키지

| 패키지 | 설명 | npm |
|---|---|---|
| [`@superbase/tokens`](packages/tokens) | 디자인 토큰 단일 소스 → 웹 CSS 변수 + RN 숫자 토큰 (Style Dictionary) | `0.1.0` |
| [`@superbase/react`](packages/react) | 웹 컴포넌트 5종 (CSS Modules + 토큰 변수, Vite 라이브러리) | `0.1.0` |
| [`@superbase/react-native`](packages/react-native) | 동일 API 모바일 컴포넌트 5종 | `0.1.0` |
| [`apps/docs`](apps/docs) | Next.js 문서 사이트 (비공개) | — |

컴포넌트: **Text · Button · TextField · Stack · Switch** (웹·모바일 동일 API).

## 사용

```bash
# 웹
npm install @superbase/tokens @superbase/react react react-dom
```
```tsx
import "@superbase/tokens/css";        // CSS 변수 (:root + [data-theme="dark"])
import "@superbase/react/styles.css";  // 컴포넌트 스타일
import { Button, Text } from "@superbase/react";
```
```bash
# 모바일 (react-native는 앱의 peer)
npm install @superbase/react-native @superbase/tokens
```

다크 테마: 최상위 요소에 `data-theme="dark"`.

## 개발

```bash
pnpm install
pnpm turbo run typecheck test build   # 전체 검증
pnpm --filter @superbase/docs exec next dev -p 3100   # 문서 사이트
```

모노레포: **pnpm workspace + Turborepo**. 컴포넌트는 TDD(Vitest + Testing Library)로 작성.

## 배포

[Changesets](https://github.com/changesets/changesets)로 버전을 관리한다.

```bash
pnpm changeset          # 변경 기록
pnpm version-packages   # 버전 + CHANGELOG
pnpm run release        # 빌드 + npm 배포
```

## 라이선스

MIT
