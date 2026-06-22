# Phase 3b — 오버레이 인프라 + Modal 설계

날짜: 2026-06-22
범위: Phase 3(새 컴포넌트)의 **오버레이 배치 1번** — 웹 오버레이 인프라(portal/focus-trap/scroll-lock/escape) + Modal/Dialog(compound-lite, web + RN) + 문서.

## 배경 / 결정

오버레이 계열(Modal·Toast·Tooltip·Popover·Dropdown/Menu·Select)은 한 spec에 담기엔 큼 → **분해**. 첫 서브배치는 **인프라 + Modal**(가장 견고한 토대 우선). 이후 Toast → Tooltip/Popover → Dropdown/Menu → Select는 각각 별도 spec.

확정된 결정:
- **분해/시작점**: 인프라 + Modal 먼저.
- **Modal API**: compound-lite — `Modal`(root) + 선택적 `ModalHeader`/`ModalBody`/`ModalFooter`. (Tabs와 동일한 compound 패턴.)
- **인프라 구현**: 자체 구현(zero-runtime-dep 유지). `createPortal` + 자체 focus-trap/scroll-lock/escape. 라이브러리(@floating-ui 등) 미사용.
- **RN**: 네이티브 `Modal` 래핑.
- **애니메이션**: 웹은 enter-only(CSS keyframe), exit 트랜지션은 백로그. RN은 네이티브 `animationType="fade"`로 enter+exit 둘 다.
- **플랫폼**: web + RN 함께 + 문서.

토큰 기반은 이미 존재: z-index(`overlay` 1200 / `modal` 1300 등), motion(duration/easing), shadow, focus-ring, radius. 신규는 scrim 색 + modal 너비만.

---

## 1) 웹 오버레이 인프라 (내부 전용, 공개 export 안 함)

신규 디렉터리 `packages/react/src/overlay/`:

- **`Portal.tsx`** — `createPortal`로 `document.body`에 children 렌더. SSR 안전: 마운트 후에만 렌더(서버/마운트 전 `null` 반환, `useEffect`로 mounted 플래그).
- **`useFocusTrap.ts`** — `(containerRef, active)`:
  - 활성화 시: `document.activeElement`(직전 포커스 요소) 저장 → 컨테이너 내 첫 포커서블 요소(또는 컨테이너 자체)로 포커스 이동.
  - Tab/Shift+Tab 키다운에서 포커서블 목록의 처음↔끝 순환(트랩).
  - 비활성화/언마운트 시: 저장한 직전 요소로 포커스 복원.
  - 포커서블 셀렉터: `a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])` 중 disabled/hidden 제외.
- **`useScrollLock.ts`** — `(active)`:
  - 활성 시 `document.documentElement`(또는 body) `overflow: hidden` + 스크롤바 폭만큼 `paddingRight` 보정(레이아웃 시프트 방지).
  - **모듈 레벨 참조 카운트**: 중첩 오버레이가 있어도 마지막 하나가 닫힐 때만 잠금 해제. 원래 inline style 저장 후 복원.
- **`useEscapeKey.ts`** — `(active, handler)`: active일 때 document `keydown` 리스너 등록 → `key === "Escape"`면 handler 호출.

> click-outside hook은 이번 배치 불필요(Modal 백드롭 = scrim div 자체 클릭으로 처리) → popover 배치로 유예(YAGNI).

이 디렉터리는 `index.ts`에서 공개 export하지 않음(내부 구현 세부).

---

## 2) 웹 Modal (compound-lite)

신규 `packages/react/src/Modal/`:

- **`ModalContext.ts`** — `{ onClose, titleId, descriptionId, registerTitle(): void, registerDescription(): void }`. `ModalHeader`/`ModalBody`가 layout effect로 자기 id 등록 → Modal이 등록된 경우에만 `aria-labelledby`/`aria-describedby` 설정. 헤더 없으면 `aria-label` prop 폴백.

- **`Modal.tsx`** (root, `forwardRef`→패널 div) — props:
  - `open: boolean`
  - `onClose: () => void`
  - `size?: "sm" | "md" | "lg"` (기본 `"md"`, max-width 토큰)
  - `closeOnBackdropClick?: boolean` (기본 `true`)
  - `closeOnEscape?: boolean` (기본 `true`)
  - `aria-label?: string` (헤더 없을 때 폴백)
  - `children`
  - 동작: `open === false`면 미렌더(`null`). `open`일 때 `<Portal>`로:
    - **scrim div** — `role="presentation"`, z-index `--z-index-overlay`, bg `--color-background-scrim`, fade-in. 클릭 시 `e.target === e.currentTarget && closeOnBackdropClick` → `onClose()`.
    - **패널 div** — `role="dialog"` + `aria-modal="true"` + aria-labelledby/describedby(또는 aria-label), z-index `--z-index-modal`, bg-default, radius-lg, shadow-lg, max-width=size. `useId()`로 titleId/descriptionId 생성.
  - hook: `useFocusTrap(panelRef, open)`, `useScrollLock(open)`, `useEscapeKey(open && closeOnEscape, onClose)`.
  - **애니메이션**: enter만 — 마운트 시 CSS keyframe(scrim fade-in, 패널 scale+fade-in), motion 토큰(`--duration-fast`, `--easing-decelerate`). exit 트랜지션은 백로그(즉시 unmount).

- **`ModalHeader.tsx`** — `<h2 id={titleId}>` 제목(children) + 기본 닫기 버튼(우상단, `Icon name="close"`, `aria-label="Close"`, context `onClose` 호출). `showCloseButton?: boolean`(기본 `true`). mount 시 `registerTitle()`.
- **`ModalBody.tsx`** — 콘텐츠 영역. `max-height` + `overflow: auto`(긴 내용 스크롤), padding(spacing). `id={descriptionId}` + mount 시 `registerDescription()`.
- **`ModalFooter.tsx`** — 액션 영역. flex row, gap(spacing-2), 우측 정렬(justify-content: flex-end).
- **`Modal.module.css`** — scrim/패널/size(max-width)/header·body·footer 레이아웃 + `@keyframes`(fade-in, scale-in).

`index.ts`에서 `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` + props 타입 export.

---

## 3) RN Modal

신규 `packages/react-native/src/Modal/`:

- **`Modal.tsx`** (root, `forwardRef`→패널 View) — props 웹과 동일(`open`/`onClose`/`size`/`closeOnBackdropClick`/`closeOnEscape`/`aria-label`). RN 네이티브 `Modal` 래핑:
  - `transparent`, `visible={open}`, `animationType="fade"`(네이티브 enter+exit), `onRequestClose={() => closeOnEscape && onClose()}`(Android 백버튼), `statusBarTranslucent`.
  - 내부: **scrim** = 전체화면 `Pressable`(bg `t.color.background.scrim`, center 정렬, `onPress` → closeOnBackdropClick 시 onClose) + **패널** `View`/`Pressable`(`useTheme()`로 bg-default·radius-lg·shadow, max-width=size 토큰, alignSelf center; 패널 `Pressable`은 onPress 전파 차단해 백드롭 닫힘 방지).
  - a11y: 패널 `accessibilityViewIsModal`(iOS) + `accessibilityLabel`(aria-label 또는 헤더 제목 폴백). RN은 aria-labelledby 미지원 → label 폴백.
  - scroll-lock/focus-trap 불필요(네이티브 Modal이 화면 점유 + 포커스 담당).
- **`ModalContext`** — onClose 제공(닫기 버튼용). RN은 id 와이어링 단순화(label 폴백).
- **`ModalHeader`** — row View. `<Text>` 제목 + 닫기 `Pressable`(`Icon name="close"`, `accessibilityLabel="Close"`). `showCloseButton?: boolean`(기본 `true`).
- **`ModalBody`** — `ScrollView`(긴 내용), padding.
- **`ModalFooter`** — row View(gap, 우측 정렬).
- ThemeProvider 없이 라이트로 통과(하위호환 유지).

`index.ts`에서 4개 컴포넌트 + 타입 export.

**web/RN 차이 요약:**
- 애니메이션: 웹 enter-only(CSS) vs RN enter+exit(네이티브 `animationType`).
- scroll-lock/focus-trap: 웹 자체 hook vs RN 네이티브 Modal 자동.
- a11y 라벨: 웹 aria-labelledby(헤더 title id) vs RN accessibilityLabel 폴백.

---

## 4) 토큰

**신규 토큰:**
- `color.background.scrim` (semantic light/dark) — light `rgba(0,0,0,0.5)`, dark `rgba(0,0,0,0.6)`. 웹 CSS `--color-background-scrim`, RN 테마 `t.color.background.scrim`.
- `size.modalSm` `360px` / `size.modalMd` `480px` / `size.modalLg` `640px` (sizing.json). 웹 max-width 변수, RN 테마 `t.size.modalSm/modalMd/modalLg`. `build.mjs`의 themeDts size 타입에 키 추가.

신규 z-index/motion/shadow/radius 토큰 없음(기존 사용).

---

## 5) 테스트 전략

**Modal (web + RN):**
- `open=false` → 미렌더. `open=true` → 패널 렌더 + `role="dialog"` + `aria-modal`(웹).
- Escape → onClose 호출. `closeOnEscape=false` → 호출 안 됨.
- scrim 클릭 → onClose. 패널 내부 클릭 → onClose **안 됨**. `closeOnBackdropClick=false` → scrim 클릭해도 호출 안 됨.
- ModalHeader title → `aria-labelledby` 연결(웹). 닫기 버튼 클릭 → onClose.
- `forwardRef`로 패널 요소 접근.

**인프라 (웹):**
- `useFocusTrap`: 열릴 때 패널(첫 포커서블)로 포커스 이동, 닫힐 때 직전 요소로 복원.
- `useScrollLock`: 열릴 때 documentElement `overflow: hidden`, 닫으면 복원. 참조카운트(중첩 시 마지막 해제까지 유지).

**전역:** 기존 테스트 무회귀. RN은 ThemeProvider 없이 라이트로 통과. 토큰 추가 시 빌드 산출물 단언(웹 CSS 변수 `--color-background-scrim`/`--size-modal-*` + RN 테마 키). 전체 `pnpm turbo run typecheck test build` 통과.

---

## 6) 문서

`apps/docs`에 `/components/modal` 페이지:
- 사이드바 nav 항목 추가 + `componentNav.test.ts` 카운트 갱신(신규 컴포넌트 추가 시 nav + nav.test 둘 다 — 과거 누락 교훈).
- Web/RN 탭(기존 패턴). 예시: 기본 Modal(open 토글 버튼), size 비교, ModalFooter 액션(취소/확인 버튼).
- RN 라이브 프리뷰는 `ClientOnly`로 마운트 후 렌더.

---

## 7) 버전 / 호환성

changeset:
- `@superbase/tokens` — minor (scrim 색 + modal size 토큰).
- `@superbase/react` — minor (overlay 인프라 + Modal).
- `@superbase/react-native` — minor (Modal).

전부 추가만 → breaking 없음. 버전 PR 머지 시 일괄 minor 배포.

---

## 8) 유예 (이 spec 밖)

- Modal exit 트랜지션(웹) — unmount 지연 상태관리 필요.
- click-outside hook — popover 배치에서.
- 이후 오버레이: Toast → Tooltip/Popover → Dropdown/Menu → Select(각각 별도 brainstorming→spec→plan).

## 구현 파일 요약

웹: `packages/react/src/overlay/{Portal.tsx,useFocusTrap.ts,useScrollLock.ts,useEscapeKey.ts}`, `packages/react/src/Modal/{Modal.tsx,ModalHeader.tsx,ModalBody.tsx,ModalFooter.tsx,ModalContext.ts,Modal.module.css,Modal.test.tsx}` + index.ts.
RN: `packages/react-native/src/Modal/{Modal.tsx,ModalHeader.tsx,ModalBody.tsx,ModalFooter.tsx,ModalContext.ts,Modal.test.tsx}` + index.ts.
토큰: `packages/tokens/src/{semantic.light.json,semantic.dark.json,sizing.json}` + `build.mjs`(themeDts size 타입).
문서: `apps/docs`의 modal 페이지 + nav + nav.test.
