# Phase 3c — Toast 설계

날짜: 2026-06-22
범위: Phase 3(새 컴포넌트)의 **오버레이 배치 2번** — Toast(transient 알림) + 명령형 Provider/Hook API(web + RN) + 문서.

## 배경 / 결정

오버레이 배치 순서: 3b 인프라+Modal(완료) → **3c Toast** → 이후 Tooltip/Popover → Dropdown/Menu → Select(각각 별도 spec). Toast는 Modal에서 만든 `Portal` 인프라를 재사용하되, focus-trap/anchor positioning이 불필요한 비모달 transient 패턴 — provider+큐+자동다스미스 타이머라는 새 패턴을 positioning 복잡도 없이 먼저 정립.

확정된 결정:
- **다음 배치**: Toast.
- **API**: `useToast()` → `{ show, success, error, warning, info, dismiss }`. `show(opts)`는 id 반환.
- **위치**: 하단 중앙(bottom-center) 단일. v1은 설정 불가(YAGNI).
- **종료 애니메이션**: enter + exit 둘 다(Provider가 라이프사이클 소유 → exiting 상태 후 제거).
- **변형**: info(기본)/success/warning/danger — status 토큰 재사용. `error()`→danger.
- **a11y role**: 일반 = `role="status"`(polite), **danger = `role="alert"`(assertive)**.
- **id**: 단조 증가 ref 카운터(`Math.random`/`Date.now` 미사용 — 환경 제약).
- **기본 duration**: 4000ms(`0`/`null`이면 sticky).
- 플랫폼: web + RN 함께 + 문서.

기존 토큰 활용: status 색(info/success/warning/danger), shadow-lg, radius-lg, spacing, motion(duration/easing), **z-index toast(1500)**. 신규는 toast 너비만.

---

## 1) 아키텍처 & API (공통 표면)

- **`ToastProvider`** — 앱 루트에 1회 마운트. `toasts` 상태 배열 소유 + 명령형 API를 context로 제공. children + 토스트 리전 렌더.
- **`useToast()`** — `useContext(ToastContext)`, provider 없으면 throw("useToast must be used within <ToastProvider>"). 반환:
  - `show(opts: ToastOptions): string` — `ToastOptions = { title: string; description?: string; variant?: ToastVariant; duration?: number | null; action?: ToastAction }`. 생성 id 반환.
  - `success(title, opts?)` / `error(title, opts?)` / `warning(title, opts?)` / `info(title, opts?)` — variant 프리셋(`error`→`danger`). `opts`는 `Omit<ToastOptions, "title" | "variant">`.
  - `dismiss(id: string): void` — 해당 토스트 즉시 종료(exit 진행).
  - `ToastVariant = "info" | "success" | "warning" | "danger"`.
  - `ToastAction = { label: string; onClick: () => void }`(웹) / `{ label: string; onPress: () => void }`(RN).
- API 객체는 **stable**: Provider가 `useMemo`로 감싸고 setState는 함수형 업데이트 → effect에서 호출해도 재생성/리렌더 유발 없음.

**플랫폼 렌더 차이:**
- **웹**: internal `Portal`(packages/react/src/overlay/Portal.tsx)로 `document.body`에 fixed 리전 렌더(`role="region"`, `aria-label="Notifications"`, `aria-live` 영역).
- **RN**: portal 없음 → Provider가 children 옆에 **절대배치 전체화면 컨테이너**(`position:absolute`, inset 0, `pointerEvents="box-none"`, 하단중앙 정렬) 렌더. **Provider는 루트 근처에 둬야 함**(다른 콘텐츠 위에 떠야 하므로) — 문서화. Animated로 enter/exit.

**파일:** `packages/{react,react-native}/src/Toast/{ToastContext.ts, ToastProvider.tsx, useToast.ts, Toast.tsx, (web)Toast.module.css, Toast.test.tsx}`. 공개 export = `ToastProvider`, `useToast` + 타입(`ToastOptions`, `ToastVariant`, `ToastAction`); 내부 `Toast`(ToastItem)는 비공개.

---

## 2) Toast 아이템 (Toast.tsx, 내부 ToastItem)

단일 토스트 렌더:
- **필드**: `title`(필수), `description`(선택, secondary 보조텍스트), variant별 leading 아이콘(success=`check`, danger=`close`, warning=`warning`, info=`info` — 패키지 `Icon`), 선택적 `action` 버튼(텍스트 버튼), 선택적 닫기 버튼(`Icon name="close"`, aria-label/accessibilityLabel="Close").
- **변형 스타일**: 카드 = surface(bg-default, shadow-lg, radius-lg, padding). leading 아이콘 색 = `--color-status-*` / `t.color.status.*`(info=info, success=success, warning=warning, danger=danger). 제목 text-primary, 설명 text-secondary.
- **a11y**: 리전 컨테이너 = `aria-live`(웹)/`accessibilityLiveRegion`(RN). 개별 토스트: info/success/warning = `role="status"`(암시적 polite), **danger = `role="alert"`(assertive)**. 닫기 버튼 접근명 "Close".
- **애니메이션**: 토스트 `status: "entering" | "visible" | "exiting"`.
  - 웹: `data-state` 기반 CSS keyframe — enter slide-up+fade-in(`--duration-base` `--easing-decelerate`), exit fade-out+slide-down/축소(`--duration-fast` `--easing-accelerate`).
  - RN: `Animated.Value`(opacity + translateY); 마운트 시 in, 종료 시 out 후 제거 콜백 호출.
- **스택**: 리전 = flex column(웹)/column View(RN), 토스트 간 `spacing-2` gap, 하단중앙. 리전 `pointer-events: none`(웹)/`box-none`(RN), 개별 토스트만 `auto`.

---

## 3) 토큰 · 라이프사이클/타이머

**신규 토큰:**
- `size.toast` = `360px`(sizing.json + themeDts size 타입). 웹 카드 `max-width: min(var(--size-toast), 100%)`(또는 리전 패딩으로 화면 여백 확보), RN `maxWidth: t.size.toast`.

신규 z-index/motion/color 없음.

**라이프사이클(ToastProvider 소유):**
- `show(opts)` → 단조 ref 카운터로 id 생성 → 배열에 `{ id, title, description, variant: opts.variant ?? "info", duration: opts.duration === undefined ? 4000 : opts.duration, action, status: "entering" }` push → 반환 id.
- enter: 웹은 CSS가 mount 시 자동 재생; status는 곧 "visible". RN은 Animated in.
- **자동 다스미스**: `duration`이 양수면 `setTimeout(duration)` 후 종료 시작. `0`/`null`이면 sticky(타이머 없음). 타이머는 Provider가 id→timeoutId 맵으로 관리, 언마운트 시 전부 clear.
- **종료**: `dismiss(id)` 또는 타이머 만료 → `status: "exiting"` 설정 + 모션 duration(`--duration-fast` 상당, 예 120ms) 타이머 → 배열에서 제거.
- action 버튼 클릭 → `action.onClick/onPress()` 호출 + 해당 토스트 dismiss.

**YAGNI(이 spec 밖):** hover-시-일시정지(웹), 스택 최대 개수 제한, swipe-to-dismiss(RN), position 설정.

---

## 4) 테스트 전략 (web + RN, fake timers)

- `useToast`가 Provider 밖에서 호출되면 throw.
- `show({ title })` → 토스트 렌더(title 텍스트 + `role="status"`). `error(...)` → `role="alert"` + danger 아이콘 색. `success/warning/info` variant별 확인.
- **자동 다스미스**: `vi.useFakeTimers()` → duration 경과 → exiting → 모션 duration 경과 → DOM에서 제거. `duration: 0` → 유지(자동 제거 없음).
- `dismiss(id)` → 종료 후 제거.
- `action` 클릭 → 콜백 호출 + 토스트 제거.
- 닫기 버튼 클릭 → 제거.
- 여러 개 `show` → 스택에 공존.
- 기존 테스트 무회귀, 전체 `pnpm turbo run typecheck test build` 통과. RN은 ThemeProvider 없이 라이트로 통과(Animated는 jsdom에서 즉시-완료로 동작하거나 timing 단순화). 토큰 추가 시 빌드 산출물 단언(`--size-toast` + `t.size.toast`).

---

## 5) 문서

`apps/docs`에 `/components/toast` 페이지:
- 사이드바 nav 항목 `{ slug: "toast", label: "Toast" }` 추가(알파벳 순: `textfield` 다음 = 목록 끝, `toast` > `text`/`textfield`) + `componentNav.test.ts` 카운트 갱신(14→15).
- Web/RN 탭. `ToastProvider`로 예시 영역을 감싸고(페이지 내 로컬 provider), 버튼들로 `show`/`success`/`error`/action 토스트 트리거. RN 라이브 프리뷰는 `ClientOnly`.

---

## 6) 버전 / 호환성

changeset:
- `@superbase/tokens` — minor(toast size).
- `@superbase/react` — minor(Toast).
- `@superbase/react-native` — minor(Toast).

전부 추가만 → breaking 없음. 버전 PR 머지 시 일괄 minor 배포.

## 구현 파일 요약

웹: `packages/react/src/Toast/{ToastContext.ts, ToastProvider.tsx, useToast.ts, Toast.tsx, Toast.module.css, Toast.test.tsx}` + index.ts(ToastProvider/useToast/타입). 기존 internal `overlay/Portal` 재사용.
RN: `packages/react-native/src/Toast/{ToastContext.ts, ToastProvider.tsx, useToast.ts, Toast.tsx, Toast.test.tsx}` + index.ts.
토큰: `packages/tokens/src/sizing.json`(size.toast) + `build.mjs`(themeDts size 타입).
문서: `apps/docs`의 toast 페이지 + nav + nav.test.
