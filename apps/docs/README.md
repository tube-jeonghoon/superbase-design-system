# @superbase/docs

Superbase 디자인 시스템 문서 사이트 (Next.js).

## 개발

    pnpm turbo run build --filter=@superbase/react   # 의존 패키지 빌드 (최초 1회)
    pnpm --filter @superbase/docs dev                # http://localhost:3000

## 빌드 / 테스트

    pnpm turbo run build --filter=@superbase/docs    # tokens·react 빌드 후 next build
    pnpm --filter @superbase/docs test               # ThemeToggle / 토큰 데이터 테스트

## 구성

- `app/` — App Router 페이지 (Getting Started / Foundations / Components)
- `components/` — AppShell, ThemeToggle, Swatch
- `lib/tokens.ts` — Foundations 표시용 토큰 데이터

다크 테마는 헤더의 스위치로 토글되며 `<html data-theme="dark">`를 설정한다.
