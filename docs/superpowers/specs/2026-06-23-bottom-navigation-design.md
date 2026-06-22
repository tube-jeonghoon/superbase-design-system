# BottomNavigation 설계 (+ 네비 아이콘 5종)

날짜: 2026-06-23
범위: 새 컴포넌트 **BottomNavigation**(floating stadium pill, 기본형 + 뒤로가기 중첩형) + 필요한 아이콘 5종 추가(web + RN) + 문서. (오버레이 로드맵과 별개의 사용자 요청 컴포넌트.)

## 배경 / 결정

레퍼런스 2종: ① 기본 하단 네비게이션 바(홈/일정/클럽/마이페이지, floating pill, 활성=강조색), ② 중첩 네비게이션 바(좌측 원형 뒤로가기 버튼 + 구분선 + 홈/일정/멤버/커뮤니티). 두 스타일을 **한 컴포넌트 + `onBack` prop**으로 커버한다.

확정된 결정:
- **아이콘**: `BottomNavigationItem.icon`은 **렌더 함수 `(active: boolean) => ReactNode`**(consumer가 활성색까지 제어, web/RN 공통). 동시에 `@superbase/icons`에 `home`·`calendar`·`users`·`chat`·`arrow-left` 5종 추가(데모/공통 + 뒤로가기 버튼이 `arrow-left` 소비).
- **활성색**: `--color-brand-primary`(파랑, 시스템 기본). 레퍼런스의 빨강은 그 앱 고유 브랜드일 뿐 — 우리 컴포넌트는 브랜드 토큰 사용.
- **API**: compound(`BottomNavigation` + `BottomNavigationItem`, value/onChange context) — 기존 Tabs와 동일 패턴.
- **기본형 vs 중첩형**: `onBack` 미제공=기본형, 제공=중첩형(좌측 원형 뒤로 버튼 + 세로 구분선).
- **위치**: 컴포넌트는 바(pill)만 제공, fixed/absolute 배치는 consumer 책임(레이아웃 비강제).
- **플랫폼**: web + RN 함께 + 문서.
- **신규 토큰 없음**: radius-full(stadium) · shadow-lg · spacing · icon lg(24) · 뒤로 버튼은 기존 `--size-field-sm`(40) 재사용.

---

## 1) 아이콘 추가 (@superbase/icons)

`packages/icons/src/iconPaths.ts`(또는 동등 단일소스)에 5개 패스 추가: `home`, `calendar`, `users`(여러 사람), `chat`(말풍선), `arrow-left`. 24px 라인 스타일(기존 18종과 동일 viewBox/stroke). `IconName`/`iconNames`는 자동 확장 → web `<Icon>`·RN `<Icon>` 양쪽에서 즉시 소비. qlmanage(PNG) 또는 헤드리스 렌더로 시각검수.

`@superbase/icons` 테스트: `iconNames`에 5종 포함 + 길이 23(18+5) 단언.

---

## 2) BottomNavigation (compound)

신규 `packages/{react,react-native}/src/BottomNavigation/`:

- **`BottomNavigationContext.ts`** — `{ value: string; onChange?: (value: string) => void }`.

- **`BottomNavigation.tsx`** (root) — props:
  - `value: string`
  - `onChange?: (value: string) => void`
  - `onBack?: () => void` — 제공 시 중첩형(좌측 원형 뒤로 버튼 + 구분선).
  - `aria-label?: string` (웹 `<nav>`/RN 컨테이너 라벨, 기본 "Bottom navigation")
  - `children` (BottomNavigationItem들)
  - 렌더: floating **stadium pill** — bg `--color-background-default`/`t.color.background.default`, `--shadow-lg`/`t.shadow.lg`, `border-radius: var(--radius-full)`/`t.radius.full`, 가로 패딩 spacing-2, flex row. context로 `{value,onChange}` 제공. 위치 미지정.
  - **웹 a11y**: `<nav aria-label>`; 내부 아이템이 `aria-current="page"`로 활성 표시.
  - **RN**: `<View>` 컨테이너(accessibilityRole 없음 — RN엔 nav 역할 없음; `accessibilityLabel`만).
  - 중첩형(`onBack`): 아이템들 앞에 원형 뒤로 버튼(40=`--size-field-sm`/`t.size.fieldSm`, bg `--color-background-subtle`, `Icon name="arrow-left"` color text-primary, aria-label/accessibilityLabel="뒤로") + 세로 구분선(`--color-border-default`, 두께 `--border-width-thin`) + spacing.

- **`BottomNavigationItem.tsx`** — props:
  - `value: string`
  - `icon: (active: boolean) => ReactNode`
  - `label: ReactNode`
  - `disabled?: boolean`
  - 렌더: `active = context.value === value`. column 정렬(아이콘 위 + 라벨 아래, gap spacing-1), 세로 패딩 spacing-2, `flex: 1`(균등 분할). `icon(active)` 호출해 아이콘 렌더. 라벨은 caption 크기 텍스트(웹 `<span>` + data-active CSS / RN `<Text>` 인라인 색): 활성 `--color-brand-primary`/`t.color.brand.primary`(weight medium), 비활성 `--color-text-secondary`/`t.color.text.secondary`. disabled면 `--opacity-disabled`/`t.opacity.disabled` + 클릭 무반응.
  - 클릭/onPress → `disabled` 아니면 `onChange(value)`.
  - **웹**: `<button type="button" aria-current={active ? "page" : undefined} disabled={disabled}>`.
  - **RN**: `<Pressable accessibilityRole="button" accessibilityState={{ selected: active, disabled }} disabled={disabled}>`.

- **`BottomNavigation.module.css`**(웹만) — `.bar`(pill), `.item`(column flex:1), `.label`(caption) + `.item[data-active="true"] .label`(brand) / 비활성 secondary, `.back`(원형 버튼), `.divider`. focus-visible focus-ring(아이템·뒤로 버튼).

각 `index.ts`에서 `BottomNavigation` + `BottomNavigationItem` + props 타입 export.

---

## 3) 테스트 전략 (web + RN)

- 아이템 렌더(라벨/아이콘) + 활성 표시: 웹 활성 아이템 `aria-current="page"`(비활성은 미설정) / RN `accessibilityState.selected`.
- 아이템 클릭 → `onChange(value)` 호출. `disabled` 아이템 클릭 → `onChange` 미호출.
- **`icon` 렌더 함수가 활성 여부로 호출됨**: 활성 아이템엔 `active=true`, 비활성엔 `false`로 호출(예: `icon={(a) => <span>{a ? "on" : "off"}</span>}`로 텍스트 분기 검증).
- `onBack` 미제공 → 뒤로 버튼 없음(`queryByLabelText("뒤로")` null). 제공 → 뒤로 버튼 렌더 + 클릭 → `onBack` 호출.
- forwardRef는 범위 밖(compound, Tabs와 동일하게 함수 컴포넌트 — ref 불필요). 
- `@superbase/icons`: 신규 5종 포함 + 길이 23 단언.
- 기존 테스트 무회귀, 전체 `pnpm turbo run typecheck test build` 통과. RN은 ThemeProvider 없이 라이트 통과. 헤드리스 Chrome로 web/RN 기본형·중첩형 시각검수(floating pill, 활성 파랑, 뒤로 버튼).

---

## 4) 문서

`apps/docs`에 `/components/bottom-navigation` 페이지:
- 사이드바 nav 항목 `{ slug: "bottom-navigation", label: "BottomNavigation" }` 추가(알파벳 순: `badge`와 `button` 사이 — `badge`(ba) < `bottom`(bo) < `button`(bu)) + `componentNav.test.ts` 카운트 갱신(15→16).
- Web/RN 탭. 예시 2개: **기본형**(홈/일정/클럽/마이페이지, `icon={(active) => <Icon name="home" color={active ? brand : secondary} />}` 식) + **중첩형**(`onBack`, 홈/일정/멤버/커뮤니티). 바를 회색 컨테이너(폰 프레임 느낌)에 배치해 floating 확인. RN 라이브 프리뷰는 `ClientOnly`. 활성색 토큰값은 페이지에서 CSS 변수/테마로 전달.

---

## 5) 버전 / 호환성

changeset:
- `@superbase/icons` — minor(아이콘 5종 추가).
- `@superbase/react` — minor(BottomNavigation; `arrow-left` 소비).
- `@superbase/react-native` — minor(BottomNavigation).

tokens 변경 없음. 전부 추가만 → breaking 없음.

## 6) 유예 (이 spec 밖, YAGNI)

- 아이템 알림 배지/도트.
- 고정 위치(fixed bottom) 강제 옵션.
- 아이템 5개 초과 시 가변폭/스크롤.

## 구현 파일 요약

아이콘: `packages/icons/src/iconPaths.ts`(+5) + `packages/icons` 테스트.
웹: `packages/react/src/BottomNavigation/{BottomNavigationContext.ts, BottomNavigation.tsx, BottomNavigationItem.tsx, BottomNavigation.module.css, BottomNavigation.test.tsx}` + index.ts.
RN: `packages/react-native/src/BottomNavigation/{BottomNavigationContext.ts, BottomNavigation.tsx, BottomNavigationItem.tsx, BottomNavigation.test.tsx}` + index.ts.
문서: `apps/docs`의 bottom-navigation 페이지 + nav + nav.test.
