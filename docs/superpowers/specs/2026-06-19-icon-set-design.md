# 아이콘 세트 — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨

## 1. 배경 & 목표

자체 큐레이션한 SVG 아이콘 세트를 웹·모바일 공통 `<Icon name="...">` API로 제공한다. SVG 패스 데이터를 한 곳에 정의(단일 소스)해 두 플랫폼이 공유하고, name은 타입 유니온으로 안전하게 한다.

### 성공 기준
- `@superbase/react`와 `@superbase/react-native`에서 `<Icon name="..." size color />`로 동일하게 쓸 수 있다.
- 아이콘 패스가 한 곳(`@superbase/icons`)에 정의되어 두 플랫폼이 공유한다.
- `name`이 타입 유니온이라 오타가 컴파일에서 잡힌다.
- 18개 공통 아이콘이 24px 그리드 라인 스타일로 일관된다.
- `pnpm turbo run typecheck test build`가 전부 통과한다.

### 결정 사항(브레인스토밍)
- 소싱: **자체 큐레이션** SVG(외부 의존성 없음)
- 플랫폼: **웹 + 모바일 둘 다**
- API: **단일 `<Icon name>`** (개별 컴포넌트 아님)

## 2. 패키지 구조 (단일 소스)

- **새 패키지 `@superbase/icons`** — 프레임워크 무관 데이터만:
  - `type IconName` (18개 이름의 유니온)
  - `iconPaths: Record<IconName, string>` (각 아이콘의 SVG path `d` 문자열)
  - `iconNames: IconName[]` (반복용 배열)
  - `ICON_VIEWBOX = "0 0 24 24"`
  - 빌드: tsc → js + d.ts. publishConfig public, version 0.1.0.
- **`@superbase/react`** → `Icon` 컴포넌트(인라인 `<svg>`). `@superbase/icons` 의존.
- **`@superbase/react-native`** → `Icon` 컴포넌트(`react-native-svg`로 렌더). `@superbase/icons` 의존 + `react-native-svg` peer.

> 모든 아이콘은 stroke 기반 라인 스타일(`fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`)을 가정한다. `iconPaths`는 path의 `d` 값만 담고, stroke 속성은 Icon 컴포넌트가 `<svg>`/`<Svg>`에 부여한다.

## 3. Icon API (웹·RN 공통)

- props: `name: IconName`, `size?: number`(기본 20), `color?: string`, `label?: string`
- **웹**: `<svg width=size height=size viewBox=ICON_VIEWBOX fill="none" stroke={color ?? "currentColor"} ...><path d={iconPaths[name]} /></svg>`. `color` 기본 `currentColor`(텍스트색 상속).
- **RN**: `react-native-svg`의 `<Svg width height viewBox><Path d stroke={color} .../></Svg>`. `color` 기본 토큰색(`ColorTextPrimary`) — RN-svg는 `currentColor` 미지원.
- **접근성**: `label`이 있으면 웹은 `role="img"` + `aria-label={label}`, RN은 `accessibilityRole="image"` + `accessibilityLabel`. 없으면 웹 `aria-hidden="true"`(장식).

## 4. 아이콘 목록 (18개, 24px viewBox, 라인 스타일)

`chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`, `check`, `close`, `plus`, `minus`, `search`, `menu`, `info`, `warning`, `success`, `error`, `star`, `heart`, `user`, `settings`

(추가는 `@superbase/icons`에 항목 1개 추가로 끝난다.)

## 5. 파일 구조

```
packages/icons/                      # 새 패키지 (데이터)
├─ src/index.ts                      # IconName, iconPaths, iconNames, ICON_VIEWBOX
├─ src/index.test.ts
├─ package.json / tsconfig.json / tsconfig.build.json
└─ README.md
packages/react/src/Icon/             # 웹 Icon
├─ Icon.tsx + Icon.test.tsx
packages/react-native/src/Icon/      # RN Icon (Plan 10)
├─ Icon.tsx + Icon.test.tsx
apps/docs/app/components/icon/page.tsx  # 문서 페이지 (전체 아이콘 그리드)
```

## 6. 테스트 전략

- **@superbase/icons**: `iconNames` 길이 18, 모든 name이 `iconPaths`에 비어있지 않은 `d`를 가짐, `iconNames`와 `iconPaths` 키가 일치.
- **웹 Icon**: 주어진 name의 path `d`를 가진 `<svg>`를 렌더(svg `path` 요소의 `d` 확인), size/color 적용, `label` 있으면 `role="img"` + 접근명, 없으면 `aria-hidden`.
- **RN Icon**: `react-native-svg`로 렌더되고 path가 존재(react-native-web 헤드리스). 접근성 라벨 전달.
- **문서 페이지**: 18개 아이콘이 모두 렌더(next build + 렌더 확인).

## 7. 분해 (플랜)

- **Plan 9**: `@superbase/icons` 데이터 패키지 + 웹 `Icon`(@superbase/react) + 문서 Icon 페이지(사이드바 항목 추가) + changeset(icons·react minor).
- **Plan 10**: RN `Icon`(@superbase/react-native + react-native-svg) + changeset(react-native minor).

## 8. 범위 밖

- 색/이중톤(채움형) 아이콘 — 라인 스타일만.
- 아이콘 검색 UI, 자동 생성(피그마 연동).
- 18개 외 대량 아이콘 — 필요 시 점진 추가.
