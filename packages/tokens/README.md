# @thesuperbase/tokens

디자인 토큰 단일 소스. `src/*.json`을 Style Dictionary로 빌드해 플랫폼별 산출물을 생성한다.

## 빌드

    pnpm --filter @thesuperbase/tokens build

## 산출물

- `dist/web/variables.css` — CSS 변수. `:root`(light) + `[data-theme="dark"]`(dark).
- `dist/native/tokens.ts` — RN용 named export 상수.

## 토큰 구조

- `src/primitives.json` — 원시값 (color/spacing/radius/font)
- `src/semantic.light.json`, `src/semantic.dark.json` — 의미 기반 토큰. 컴포넌트는 semantic만 참조한다.
