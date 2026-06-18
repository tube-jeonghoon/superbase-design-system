# 디자인 시스템 (Superbase Design System) — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨 (구현 계획 작성 대기)

## 1. 배경 & 목표

여러 프로젝트(웹 + 모바일)에 일관되게 적용할 수 있는 **재사용 가능한 디자인 시스템**을 구축한다.
[TDS (Toss Design System)](https://tossmini-docs.toss.im/tds-mobile/)의 미니멀·클린한 비주얼 감성과
문서/토큰 구조를 참고하되, 브랜드 색상은 자체적으로 정의한다.

### 성공 기준
- 토큰을 한 곳에서 정의하면 웹/모바일 양쪽에 같은 값이 전파된다.
- 새 프로젝트에서 `install` 한 번으로 컴포넌트와 토큰을 가져다 쓸 수 있다.
- TDS처럼 보이는 문서 웹사이트에서 토큰과 컴포넌트를 직접 확인할 수 있다.
- v1에서 파운데이션 + 핵심 컴포넌트 5종이 웹·모바일 양쪽에서 동작한다.

### 요구사항 요약 (브레인스토밍 결정 사항)
- **적용 대상 스택**: 웹 + 모바일 둘 다 (토큰 공유, 플랫폼별 컴포넌트)
- **TDS 참고 수준**: 비주얼 느낌까지 유사하게 (브랜드 색상만 자체 정의)
- **v1 범위**: 파운데이션(토큰) + 핵심 컴포넌트 몇 개 + 문서 사이트
- **배포 방식**: 모노레포 → npm 패키지 (git URL로 시작, 추후 정식 배포 승격)
- **문서 사이트**: 커스텀 사이트 (TDS처럼), Storybook 아님

## 2. 아키텍처

### 모노레포 구성
- **도구**: pnpm workspace + Turborepo (빌드 캐싱 / 태스크 오케스트레이션)
- **버전 관리**: Changesets

```
design-library/
├─ packages/
│  ├─ tokens/         # 디자인 토큰 단일 소스(JSON) + Style Dictionary 빌드
│  ├─ react/          # 웹 컴포넌트 (@superbase/react)
│  └─ react-native/   # 모바일 컴포넌트 (@superbase/react-native)
├─ apps/
│  └─ docs/           # Next.js 커스텀 문서 사이트 (TDS풍 쇼케이스)
├─ pnpm-workspace.yaml
├─ turbo.json
└─ package.json
```

> 패키지 네임스페이스는 `@superbase/*`로 통일한다. (정식 npm 배포 전까지는 스코프만 잡아두고 git URL로 소비)

### 단위별 책임
| 단위 | 하는 일 | 인터페이스 | 의존성 |
|---|---|---|---|
| `tokens` | 디자인 토큰 정의 + 플랫폼별 빌드 산출물 생성 | `dist/web/variables.css`, `dist/native/tokens.ts` | Style Dictionary |
| `react` | 웹 컴포넌트 | export된 React 컴포넌트 + props 타입 | `tokens`(web), React |
| `react-native` | 모바일 컴포넌트 | export된 RN 컴포넌트 + props 타입 (web과 동일 API) | `tokens`(native), React Native |
| `docs` | 문서/쇼케이스 웹사이트 | 정적 사이트 | `tokens`, `react` |

## 3. 토큰 흐름 (핵심)

단일 소스(JSON) → **Style Dictionary** 빌드 → 플랫폼별 산출물:
- `dist/web/variables.css` — CSS 커스텀 프로퍼티 (예: `--color-text-primary`)
- `dist/native/tokens.ts` — 타입 있는 TS 객체

웹/모바일이 같은 값을 다른 형식으로 소비한다. 토큰만 바꾸면 양쪽에 전파된다.

### 토큰 구조
- **카테고리**: color, typography(font size/weight/line-height), spacing, radius, shadow
- **2단 구조 (semantic 토큰)**:
  - primitive: `color.blue.500`, `spacing.4` 등 원시값
  - semantic: `color.text.primary`, `color.background.default` 등 의미 기반 (컴포넌트는 semantic만 참조)
- **테마**: light / dark 2종. semantic 토큰이 테마별로 다른 primitive를 가리킨다.

## 4. 스타일링 방식

- **웹(react)**: CSS Modules + CSS 변수. 런타임 비용 없음, 가독성 높음, 프레임워크 종속 최소.
- **모바일(react-native)**: `StyleSheet` + 토큰 TS 객체.
- 두 패키지의 컴포넌트 **API(props)를 최대한 동일**하게 맞춰 학습 비용을 최소화한다.

## 5. v1 핵심 컴포넌트

각 컴포넌트는 web + native 쌍으로 제공하며, 독립적으로 이해·테스트 가능하게 분리한다.

| 컴포넌트 | 역할 | 주요 props (공통) |
|---|---|---|
| `Text` | 타이포그래피 | `variant`(예: title/body/caption), `color`, `weight` |
| `Button` | 버튼 | `variant`(primary/secondary/...), `size`, `disabled`, `onPress`/`onClick` |
| `TextField` | 텍스트 입력 | `value`, `onChange`, `placeholder`, `label`, `error` |
| `Stack`/`Box` | 레이아웃 프리미티브 | `direction`, `gap`, `padding`, `align`, `justify` |
| `Switch` | 토글 | `value`, `onChange`, `disabled` |

## 6. 문서 사이트 (apps/docs)

Next.js로 만든 TDS풍 커스텀 사이트. 실제 `@superbase/react`를 import해서 라이브 렌더(dogfooding).

### 정보 구조
- **Getting Started**: 설치 / 다른 프로젝트에 적용하는 가이드
- **Foundations**: 색 / 타이포 / 간격 / radius / shadow 토큰 시각화
- **Components**: 컴포넌트별 라이브 렌더 + props 표 + 코드 스니펫
- 라이트/다크 테마 토글로 토큰 테마 전환을 시연

## 7. 배포 & 적용

- 시작: 다른 프로젝트에서 git URL로 소비 (`npm install github:tube/design-library` 형태, workspace 패키지 지정)
- 안정화 후: npm 또는 GitHub Packages로 정식 배포 승격
- Changesets로 버전·체인지로그 관리

## 8. 테스트 전략

- **tokens**: 빌드 산출물(`variables.css`, `tokens.ts`) 스냅샷 테스트로 회귀 방지
- **react**: Vitest + Testing Library로 컴포넌트 동작 테스트, 기본 접근성 체크
- **react-native**: 컴포넌트 렌더/동작 테스트 (RN 테스트 환경)
- **docs**: 빌드 성공 + 핵심 페이지 렌더 확인

## 9. 범위 밖 (v1에서 하지 않음)

- 5종 외 추가 컴포넌트 (Modal, Toast, Select 등) — v2 이후
- 정식 npm 레지스트리 배포 자동화 — 안정화 후
- 아이콘 세트 — v2 이후 (필요 시 v1에 최소 아이콘만 검토)
- Figma 연동 / 디자인 툴 토큰 동기화
