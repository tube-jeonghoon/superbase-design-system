# Phase 3c — Toast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** transient 알림 Toast 컴포넌트 + 명령형 `ToastProvider`/`useToast()` API를 web + RN에 추가한다.

**Architecture:** `ToastProvider`가 토스트 배열 상태와 자동 다스미스 타이머를 소유하고 명령형 API(`show`/`success`/`error`/`warning`/`info`/`dismiss`)를 context로 제공한다. 웹은 internal `Portal`로 body에 fixed 리전을 렌더, RN은 절대배치 컨테이너(box-none)를 렌더한다. 라이프사이클(entering→visible→exiting→제거)은 Provider가 타이머로 결정론적으로 구동하고, 시각 전환만 플랫폼별(웹 CSS / RN Animated)로 처리한다. 신규 토큰은 toast 너비만.

**Tech Stack:** React 19, TypeScript, CSS Modules(웹), react-native(+react-native-web 테스트), Style Dictionary 토큰, vitest(fake timers), changesets.

**Spec:** `docs/superpowers/specs/2026-06-22-phase3c-toast-design.md`

**전역 규약(기존 패턴):**
- 웹은 CSS Module + 토큰 CSS 변수, RN은 `useTheme()` 런타임 테마. RN 테스트는 ThemeProvider 없이 라이트로 통과.
- `describe/it/expect/vi`는 글로벌(import 불필요). 웹/RN 모두 vitest + jsdom + `@testing-library/react`. RN 패키지는 `react-native`→`react-native-web` 별칭.
- 신규 컴포넌트+테스트는 **폴더 단위 커밋**.
- **spacing 스케일은 0/1/2/3/4/6/8 — 5·7 없음.** spacing-5/7 쓰지 말 것.
- 컴포넌트 태스크는 test뿐 아니라 **typecheck도** 확인.
- 각 패키지: `pnpm --filter @superbase/<pkg> test|typecheck|build`. 전체: `pnpm turbo run typecheck test build`.

**파일 구조:**
- 토큰: `packages/tokens/src/sizing.json`(size.toast) + `build.mjs`(themeDts size 타입).
- 웹: `packages/react/src/Toast/{types.ts, ToastContext.ts, useToast.ts, Toast.tsx, Toast.module.css, ToastProvider.tsx, Toast.test.tsx}` + index.ts. internal `overlay/Portal` 재사용.
- RN: `packages/react-native/src/Toast/{types.ts, ToastContext.ts, useToast.ts, Toast.tsx, ToastProvider.tsx, Toast.test.tsx}` + index.ts.
- 문서: `apps/docs/app/components/toast/page.tsx` + `componentNav.ts` + `componentNav.test.ts`.

**공유 상수(양 플랫폼 동일):**
- variant→icon: `{ info: "info", success: "success", warning: "warning", danger: "error" }`.
- 기본 duration: `4000`ms. exit 모션 대기: `EXIT_MS = 120`(= `--duration-fast`).
- id: 모듈 카운터 `let n=0; const nextId = () => \`toast-${++n}\``.

---

## Task 1: 토큰 — toast 너비

**Files:**
- Modify: `packages/tokens/src/sizing.json`
- Modify: `packages/tokens/build.mjs` (themeDts size 타입)
- Test: `packages/tokens/test/build.test.ts`

- [ ] **Step 1: build 단언 테스트 추가(실패 예상)**

`packages/tokens/test/build.test.ts`의 `describe("token build outputs", ...)` 안에 추가:

```typescript
it("emits toast size token", () => {
  const css = readFileSync(join(dist, "web/variables.css"), "utf8");
  expect(css).toContain("--size-toast: 360px;");
  const theme = readFileSync(join(dist, "native/theme.js"), "utf8");
  expect(theme).toContain('"toast": 360');
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/tokens test -- build.test`
Expected: FAIL — `--size-toast` 없음.

- [ ] **Step 3: 토큰 추가**

`packages/tokens/src/sizing.json`의 `size` 객체에서 `modal` 블록 뒤(닫는 `}` 앞)에 `,` 추가 후:

```json
    "toast": { "value": "360px" }
```

- [ ] **Step 4: themeDts 타입 갱신**

`packages/tokens/build.mjs`의 `themeDts()` `size:` 블록에서 `modal: { sm: number; md: number; lg: number };` 줄 뒤에 추가:

```javascript
    toast: number;
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS. 스냅샷 변하면 `pnpm --filter @superbase/tokens test -- -u`, diff가 toast 항목만 추가하는지 확인.

- [ ] **Step 6: 토큰 빌드(dist 갱신)**

Run: `pnpm --filter @superbase/tokens build`
Expected: 성공. `dist/web/variables.css`에 `--size-toast: 360px;`, `dist/native/theme.js`에 `"toast": 360`.

- [ ] **Step 7: 커밋**

```bash
git add packages/tokens/src packages/tokens/build.mjs packages/tokens/test
git commit -m "feat(tokens): add toast size token"
```

---

## Task 2: 웹 — 타입 + Context + useToast

**Files:**
- Create: `packages/react/src/Toast/types.ts`
- Create: `packages/react/src/Toast/ToastContext.ts`
- Create: `packages/react/src/Toast/useToast.ts`
- Test: `packages/react/src/Toast/useToast.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/Toast/useToast.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { useToast } from "./useToast";

function Probe() {
  useToast();
  return null;
}

describe("useToast", () => {
  it("throws when used outside ToastProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- useToast`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: types 구현**

`packages/react/src/Toast/types.ts`:

```ts
export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms until auto-dismiss. 0 or null = sticky. Defaults to 4000. */
  duration?: number | null;
  action?: ToastAction;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number | null;
  action?: ToastAction;
  status: "entering" | "visible" | "exiting";
}

export type ToastConvenienceOptions = Omit<ToastOptions, "title" | "variant">;

export interface ToastApi {
  show: (opts: ToastOptions) => string;
  success: (title: string, opts?: ToastConvenienceOptions) => string;
  error: (title: string, opts?: ToastConvenienceOptions) => string;
  warning: (title: string, opts?: ToastConvenienceOptions) => string;
  info: (title: string, opts?: ToastConvenienceOptions) => string;
  dismiss: (id: string) => void;
}
```

- [ ] **Step 4: ToastContext 구현**

`packages/react/src/Toast/ToastContext.ts`:

```ts
import { createContext } from "react";
import type { ToastApi } from "./types";

export const ToastContext = createContext<ToastApi | null>(null);
```

- [ ] **Step 5: useToast 구현**

`packages/react/src/Toast/useToast.ts`:

```ts
import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastApi } from "./types";

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm --filter @superbase/react test -- useToast`
Expected: PASS.

- [ ] **Step 7: 커밋**

```bash
git add packages/react/src/Toast/types.ts packages/react/src/Toast/ToastContext.ts packages/react/src/Toast/useToast.ts packages/react/src/Toast/useToast.test.tsx
git commit -m "feat(react): add Toast types + context + useToast"
```

---

## Task 3: 웹 — Toast 아이템 + CSS

**Files:**
- Create: `packages/react/src/Toast/Toast.tsx`
- Create: `packages/react/src/Toast/Toast.module.css`
- Test: `packages/react/src/Toast/ToastItem.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/Toast/ToastItem.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";
import type { ToastData } from "./types";

function makeToast(over: Partial<ToastData> = {}): ToastData {
  return { id: "t1", title: "제목", variant: "info", duration: 4000, status: "visible", ...over };
}

describe("Toast item", () => {
  it("renders title and description", () => {
    render(<Toast toast={makeToast({ description: "설명" })} onDismiss={() => {}} />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("uses role=status for non-danger and role=alert for danger", () => {
    const { rerender } = render(<Toast toast={makeToast()} onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Toast toast={makeToast({ variant: "danger" })} onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("close button calls onDismiss with id", () => {
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("action button fires action then dismisses", () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast({ action: { label: "실행취소", onClick } })} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "실행취소" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("exposes data-variant and data-state", () => {
    const { container } = render(<Toast toast={makeToast({ variant: "success", status: "exiting" })} onDismiss={() => {}} />);
    const el = container.querySelector('[data-variant="success"]');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("data-state", "exiting");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- ToastItem`
Expected: FAIL — `./Toast` 없음.

- [ ] **Step 3: Toast 아이템 구현**

`packages/react/src/Toast/Toast.tsx`:

```tsx
import { Icon } from "../Icon/Icon";
import type { ToastData } from "./types";
import styles from "./Toast.module.css";

const VARIANT_ICON = { info: "info", success: "success", warning: "warning", danger: "error" } as const;

export interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastItemProps) {
  const { id, title, description, variant, action, status } = toast;
  return (
    <div
      className={styles.toast}
      data-variant={variant}
      data-state={status}
      role={variant === "danger" ? "alert" : "status"}
    >
      <span className={styles.icon}>
        <Icon name={VARIANT_ICON[variant]} size="sm" />
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            action.onClick();
            onDismiss(id);
          }}
        >
          {action.label}
        </button>
      )}
      <button type="button" className={styles.close} aria-label="Close" onClick={() => onDismiss(id)}>
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: CSS 작성**

`packages/react/src/Toast/Toast.module.css`:

```css
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  width: 100%;
  max-width: var(--size-toast);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-background-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}
.toast[data-state="entering"] {
  animation: sb-toast-in var(--duration-base) var(--easing-decelerate);
}
.toast[data-state="exiting"] {
  animation: sb-toast-out var(--duration-fast) var(--easing-accelerate) forwards;
}
.icon { display: inline-flex; flex-shrink: 0; padding-top: 2px; }
.toast[data-variant="info"] .icon { color: var(--color-status-info); }
.toast[data-variant="success"] .icon { color: var(--color-status-success); }
.toast[data-variant="warning"] .icon { color: var(--color-status-warning); }
.toast[data-variant="danger"] .icon { color: var(--color-status-danger); }
.content { flex: 1; min-width: 0; }
.title {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}
.description {
  margin: var(--spacing-1) 0 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}
.action {
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0 var(--spacing-1);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-brand-primary);
  cursor: pointer;
}
.close {
  flex-shrink: 0;
  display: inline-flex;
  border: none;
  background: transparent;
  padding: var(--spacing-1);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
@keyframes sb-toast-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sb-toast-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(8px); }
}
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/react test -- ToastItem`
Expected: PASS (5 tests).

- [ ] **Step 6: 커밋**

```bash
git add packages/react/src/Toast/Toast.tsx packages/react/src/Toast/Toast.module.css packages/react/src/Toast/ToastItem.test.tsx
git commit -m "feat(react): add Toast item presentational component"
```

---

## Task 4: 웹 — ToastProvider (라이프사이클/타이머/API)

**Files:**
- Create: `packages/react/src/Toast/ToastProvider.tsx`
- Test: `packages/react/src/Toast/ToastProvider.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/Toast/ToastProvider.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";

function Harness() {
  const t = useToast();
  return (
    <div>
      <button onClick={() => t.show({ title: "기본" })}>show</button>
      <button onClick={() => t.error("실패함")}>error</button>
      <button onClick={() => t.show({ title: "고정", duration: 0 })}>sticky</button>
    </div>
  );
}

function setup() {
  return render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );
}

describe("ToastProvider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("show renders a toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("error renders an assertive toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("실패함")).toBeInTheDocument();
  });

  it("auto-dismisses after duration + exit motion", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); }); // duration -> exiting
    expect(screen.getByText("기본")).toBeInTheDocument(); // still mounted (exiting)
    act(() => { vi.advanceTimersByTime(120); }); // exit motion -> removed
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("duration 0 stays sticky", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("sticky")); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText("고정")).toBeInTheDocument();
  });

  it("dismiss via close button removes the toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "Close" })); });
    act(() => { vi.advanceTimersByTime(120); });
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("stacks multiple toasts", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByText("실패함")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- ToastProvider`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: ToastProvider 구현**

`packages/react/src/Toast/ToastProvider.tsx`:

```tsx
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { Portal } from "../overlay/Portal";
import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import type { ToastApi, ToastData, ToastOptions, ToastConvenienceOptions } from "./types";
import styles from "./Toast.module.css";

const DEFAULT_DURATION = 4000;
const EXIT_MS = 120; // matches --duration-fast

let idCounter = 0;
const nextId = () => `toast-${++idCounter}`;

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const startExit = useCallback(
    (id: string) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, status: "exiting" } : t)));
      const tm = setTimeout(() => remove(id), EXIT_MS);
      timers.current.set(id, tm);
    },
    [remove],
  );

  const show = useCallback(
    (opts: ToastOptions) => {
      const id = nextId();
      const duration = opts.duration === undefined ? DEFAULT_DURATION : opts.duration;
      const toast: ToastData = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "info",
        duration,
        action: opts.action,
        status: "entering",
      };
      setToasts((list) => [...list, toast]);
      if (duration && duration > 0) {
        const tm = setTimeout(() => startExit(id), duration);
        timers.current.set(id, tm);
      }
      return id;
    },
    [startExit],
  );

  const dismiss = useCallback((id: string) => startExit(id), [startExit]);

  const api = useMemo<ToastApi>(() => {
    const make = (variant: ToastData["variant"]) => (title: string, opts?: ToastConvenienceOptions) =>
      show({ ...opts, title, variant });
    return {
      show,
      success: make("success"),
      error: make("danger"),
      warning: make("warning"),
      info: make("info"),
      dismiss,
    };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <div className={styles.region} role="region" aria-label="Notifications">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 4: CSS에 region 추가**

`packages/react/src/Toast/Toast.module.css` 끝에 추가:

```css
.region {
  position: fixed;
  left: 50%;
  bottom: var(--spacing-6);
  transform: translateX(-50%);
  z-index: var(--z-index-toast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  width: calc(100% - var(--spacing-8));
  max-width: var(--size-toast);
  pointer-events: none;
}
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/react test -- ToastProvider`
Expected: PASS (6 tests).

- [ ] **Step 6: 커밋**

```bash
git add packages/react/src/Toast/ToastProvider.tsx packages/react/src/Toast/Toast.module.css packages/react/src/Toast/ToastProvider.test.tsx
git commit -m "feat(react): add ToastProvider (lifecycle + imperative API)"
```

---

## Task 5: 웹 — index.ts export

**Files:**
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react/src/index.ts` 끝에 추가:

```ts
export { ToastProvider } from "./Toast/ToastProvider";
export type { ToastProviderProps } from "./Toast/ToastProvider";
export { useToast } from "./Toast/useToast";
export type { ToastOptions, ToastVariant, ToastAction } from "./Toast/types";
```

- [ ] **Step 2: 빌드 + 타입체크**

Run: `pnpm --filter @superbase/react typecheck && pnpm --filter @superbase/react build`
Expected: 성공. (`Toast` 아이템은 내부 — export 안 함.)

- [ ] **Step 3: 커밋**

```bash
git add packages/react/src/index.ts
git commit -m "feat(react): export ToastProvider + useToast"
```

---

## Task 6: RN — 타입 + Context + useToast

**Files:**
- Create: `packages/react-native/src/Toast/types.ts`
- Create: `packages/react-native/src/Toast/ToastContext.ts`
- Create: `packages/react-native/src/Toast/useToast.ts`
- Test: `packages/react-native/src/Toast/useToast.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react-native/src/Toast/useToast.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { useToast } from "./useToast";

function Probe() {
  useToast();
  return null;
}

describe("useToast (RN)", () => {
  it("throws when used outside ToastProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- useToast`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: types 구현 (RN — action은 onPress)**

`packages/react-native/src/Toast/types.ts`:

```ts
export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms until auto-dismiss. 0 or null = sticky. Defaults to 4000. */
  duration?: number | null;
  action?: ToastAction;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number | null;
  action?: ToastAction;
  status: "entering" | "visible" | "exiting";
}

export type ToastConvenienceOptions = Omit<ToastOptions, "title" | "variant">;

export interface ToastApi {
  show: (opts: ToastOptions) => string;
  success: (title: string, opts?: ToastConvenienceOptions) => string;
  error: (title: string, opts?: ToastConvenienceOptions) => string;
  warning: (title: string, opts?: ToastConvenienceOptions) => string;
  info: (title: string, opts?: ToastConvenienceOptions) => string;
  dismiss: (id: string) => void;
}
```

- [ ] **Step 4: ToastContext 구현**

`packages/react-native/src/Toast/ToastContext.ts`:

```ts
import { createContext } from "react";
import type { ToastApi } from "./types";

export const ToastContext = createContext<ToastApi | null>(null);
```

- [ ] **Step 5: useToast 구현**

`packages/react-native/src/Toast/useToast.ts`:

```ts
import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastApi } from "./types";

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- useToast`
Expected: PASS.

- [ ] **Step 7: 커밋**

```bash
git add packages/react-native/src/Toast/types.ts packages/react-native/src/Toast/ToastContext.ts packages/react-native/src/Toast/useToast.ts packages/react-native/src/Toast/useToast.test.tsx
git commit -m "feat(react-native): add Toast types + context + useToast"
```

---

## Task 7: RN — Toast 아이템 (Animated)

**Files:**
- Create: `packages/react-native/src/Toast/Toast.tsx`
- Test: `packages/react-native/src/Toast/ToastItem.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react-native/src/Toast/ToastItem.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";
import type { ToastData } from "./types";

function makeToast(over: Partial<ToastData> = {}): ToastData {
  return { id: "t1", title: "제목", variant: "info", duration: 4000, status: "visible", ...over };
}

describe("Toast item (RN)", () => {
  it("renders title and description", () => {
    render(<Toast toast={makeToast({ description: "설명" })} onDismiss={() => {}} />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("danger uses role alert, others status", () => {
    const { rerender } = render(<Toast toast={makeToast()} onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Toast toast={makeToast({ variant: "danger" })} onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("close button calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("action fires onPress then dismisses", () => {
    const onPress = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast({ action: { label: "실행취소", onPress } })} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText("실행취소"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- ToastItem`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: Toast 아이템 구현**

`packages/react-native/src/Toast/Toast.tsx`:

```tsx
import { useEffect, useRef } from "react";
import { Animated, View, Text as RNText, Pressable, type TextStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import type { ToastData } from "./types";

const VARIANT_ICON = { info: "info", success: "success", warning: "warning", danger: "error" } as const;

export interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastItemProps) {
  const t = useTheme();
  const { id, title, description, variant, action, status } = toast;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: t.motion.duration.base, useNativeDriver: true }).start();
  }, [anim, t.motion.duration.base]);

  useEffect(() => {
    if (status === "exiting") {
      Animated.timing(anim, { toValue: 0, duration: t.motion.duration.fast, useNativeDriver: true }).start();
    }
  }, [status, anim, t.motion.duration.fast]);

  return (
    <Animated.View
      role={variant === "danger" ? "alert" : "status"}
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        flexDirection: "row",
        alignItems: "flex-start",
        gap: t.spacing["3"],
        width: "100%",
        maxWidth: t.size.toast,
        padding: t.spacing["3"],
        backgroundColor: t.color.background.default,
        borderRadius: t.radius.lg,
        ...t.shadow.lg,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        <Icon name={VARIANT_ICON[variant]} size="sm" color={t.color.status[variant]} />
      </View>
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: t.font.size.body, fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"], color: t.color.text.primary }}>
          {title}
        </RNText>
        {description ? (
          <RNText style={{ marginTop: t.spacing["1"], fontSize: t.font.size.caption, color: t.color.text.secondary }}>
            {description}
          </RNText>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            action.onPress();
            onDismiss(id);
          }}
        >
          <RNText style={{ fontSize: t.font.size.caption, fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"], color: t.color.brand.primary }}>
            {action.label}
          </RNText>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => onDismiss(id)}>
        <Icon name="close" size="sm" color={t.color.text.secondary} />
      </Pressable>
    </Animated.View>
  );
}
```

> 주: RN의 `accessibilityRole` union에는 `"status"`가 없으므로(=`alert`만 존재) **W3C `role` prop**을 쓴다(RN 0.71+ `Role` 타입은 `"status"`·`"alert"` 모두 허용, RNW는 DOM `role` 속성으로 매핑 → 테스트 `getByRole("status")`/`getByRole("alert")` 통과). 만약 RN0.86 타입에서 `role="status"`가 막히면 `getByRole` 대신 텍스트 존재로 status 테스트를 완화하고 danger만 `role="alert"` 유지 — 단 web은 항상 status/alert 유지.

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- ToastItem`
Expected: PASS (4 tests). `getByLabelText("Close")`는 RNW가 accessibilityLabel→aria-label 매핑. 안 되면 `getByRole("button", { name: "Close" })`로 테스트 쿼리만 조정.

- [ ] **Step 5: 커밋**

```bash
git add packages/react-native/src/Toast/Toast.tsx packages/react-native/src/Toast/ToastItem.test.tsx
git commit -m "feat(react-native): add Toast item (Animated)"
```

---

## Task 8: RN — ToastProvider

**Files:**
- Create: `packages/react-native/src/Toast/ToastProvider.tsx`
- Test: `packages/react-native/src/Toast/ToastProvider.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react-native/src/Toast/ToastProvider.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Pressable, Text } from "react-native";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";

function Harness() {
  const t = useToast();
  return (
    <>
      <Pressable onPress={() => t.show({ title: "기본" })}><Text>show</Text></Pressable>
      <Pressable onPress={() => t.error("실패함")}><Text>error</Text></Pressable>
      <Pressable onPress={() => t.show({ title: "고정", duration: 0 })}><Text>sticky</Text></Pressable>
    </>
  );
}

function setup() {
  return render(<ToastProvider><Harness /></ToastProvider>);
}

describe("ToastProvider (RN)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("show renders a toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
  });

  it("error renders an assertive toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByText("실패함")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("auto-dismisses after duration + exit motion", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); });
    act(() => { vi.advanceTimersByTime(120); });
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("duration 0 stays sticky", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("sticky")); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText("고정")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- ToastProvider`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: ToastProvider 구현**

`packages/react-native/src/Toast/ToastProvider.tsx`:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import type { ToastApi, ToastData, ToastOptions, ToastConvenienceOptions } from "./types";

const DEFAULT_DURATION = 4000;
const EXIT_MS = 120;

let idCounter = 0;
const nextId = () => `toast-${++idCounter}`;

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const t = useTheme();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const startExit = useCallback(
    (id: string) => {
      setToasts((list) => list.map((x) => (x.id === id ? { ...x, status: "exiting" } : x)));
      // Cancel any pending timer (just-fired auto-dismiss, or a prior exit timer
      // if dismiss() is called mid-exit) before scheduling removal.
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      const tm = setTimeout(() => remove(id), EXIT_MS);
      timers.current.set(id, tm);
    },
    [remove],
  );

  // Clear pending timers if the provider unmounts while toasts are live.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((tm) => clearTimeout(tm));
      map.clear();
    };
  }, []);

  const show = useCallback(
    (opts: ToastOptions) => {
      const id = nextId();
      const duration = opts.duration === undefined ? DEFAULT_DURATION : opts.duration;
      const toast: ToastData = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "info",
        duration,
        action: opts.action,
        status: "entering",
      };
      setToasts((list) => [...list, toast]);
      if (duration && duration > 0) {
        const tm = setTimeout(() => startExit(id), duration);
        timers.current.set(id, tm);
      }
      return id;
    },
    [startExit],
  );

  const dismiss = useCallback((id: string) => startExit(id), [startExit]);

  const api = useMemo<ToastApi>(() => {
    const make = (variant: ToastData["variant"]) => (title: string, opts?: ToastConvenienceOptions) =>
      show({ ...opts, title, variant });
    return { show, success: make("success"), error: make("danger"), warning: make("warning"), info: make("info"), dismiss };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          paddingHorizontal: t.spacing["4"],
          paddingBottom: t.spacing["6"],
          gap: t.spacing["2"],
        }}
      >
        {toasts.map((x) => (
          <Toast key={x.id} toast={x} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- ToastProvider`
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
git add packages/react-native/src/Toast/ToastProvider.tsx packages/react-native/src/Toast/ToastProvider.test.tsx
git commit -m "feat(react-native): add ToastProvider (lifecycle + imperative API)"
```

---

## Task 9: RN — index.ts export

**Files:**
- Modify: `packages/react-native/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react-native/src/index.ts` 끝에 추가:

```ts
export { ToastProvider } from "./Toast/ToastProvider";
export type { ToastProviderProps } from "./Toast/ToastProvider";
export { useToast } from "./Toast/useToast";
export type { ToastOptions, ToastVariant, ToastAction } from "./Toast/types";
```

- [ ] **Step 2: 빌드 + 타입체크**

Run: `pnpm --filter @superbase/react-native typecheck && pnpm --filter @superbase/react-native build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add packages/react-native/src/index.ts
git commit -m "feat(react-native): export ToastProvider + useToast"
```

---

## Task 10: 문서 — Toast 페이지 + nav

**Files:**
- Modify: `apps/docs/components/docs/componentNav.ts`
- Modify: `apps/docs/components/docs/componentNav.test.ts`
- Create: `apps/docs/app/components/toast/page.tsx`

- [ ] **Step 0: 기존 패턴 확인**

READ `apps/docs/app/components/card/page.tsx`(페이지 골격: ComponentDoc + Tabs items web/native + Example + Code + ClientOnly) 및 `componentNav.ts`/`.test.ts`.

- [ ] **Step 1: nav.test 갱신**

`apps/docs/components/docs/componentNav.test.ts`:
- `expect(componentNav).toHaveLength(14);` → `toHaveLength(15);`
- 추가: `expect(componentNav.map((c) => c.slug)).toContain("toast");`

- [ ] **Step 2: nav 항목 추가**

`apps/docs/components/docs/componentNav.ts`의 `componentNav` 배열 끝(`textfield` 다음, 알파벳상 `toast` > `text`/`textfield`)에 추가:

```ts
  { slug: "toast", label: "Toast" },
```

- [ ] **Step 3: Toast 페이지 작성**

`apps/docs/app/components/toast/page.tsx`:

```tsx
"use client";
import {
  ToastProvider as WebToastProvider,
  useToast as useWebToast,
  Button as WebButton,
} from "@superbase/react";
import {
  ToastProvider as RNToastProvider,
  useToast as useRNToast,
  Button as RNButton,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" };

function WebDemo() {
  const toast = useWebToast();
  return (
    <div style={row}>
      <WebButton onClick={() => toast.show({ title: "저장되었습니다" })}>기본</WebButton>
      <WebButton variant="outline" onClick={() => toast.success("업로드 완료")}>success</WebButton>
      <WebButton variant="outline" onClick={() => toast.error("업로드 실패", { description: "다시 시도해 주세요." })}>error</WebButton>
      <WebButton variant="ghost" onClick={() => toast.info("새 메시지", { action: { label: "보기", onClick: () => {} } })}>action</WebButton>
    </div>
  );
}

function RNDemo() {
  const toast = useRNToast();
  return (
    <div style={row}>
      <RNButton onPress={() => toast.show({ title: "저장되었습니다" })}>기본</RNButton>
      <RNButton variant="outline" onPress={() => toast.success("업로드 완료")}>success</RNButton>
      <RNButton variant="outline" onPress={() => toast.error("업로드 실패", { description: "다시 시도해 주세요." })}>error</RNButton>
    </div>
  );
}

const webContent = (
  <Example
    title="기본 사용"
    description={<><Code>useToast()</Code>의 <Code>show</Code>/<Code>success</Code>/<Code>error</Code>로 토스트를 띄웁니다. 4초 후 자동으로 사라지며 하단 중앙에 쌓입니다. 앱 루트를 <Code>ToastProvider</Code>로 감싸세요.</>}
    code={`const toast = useToast();
toast.show({ title: "저장되었습니다" });
toast.success("업로드 완료");
toast.error("업로드 실패", { description: "다시 시도해 주세요." });`}
  >
    <WebToastProvider>
      <WebDemo />
    </WebToastProvider>
  </Example>
);

const nativeContent = (
  <Example
    title="기본 사용"
    description={<>RN은 <Code>ToastProvider</Code>를 앱 루트 근처에 두고(절대배치로 콘텐츠 위에 표시), <Code>action</Code>은 <Code>onPress</Code>를 받습니다.</>}
    code={`const toast = useToast();
toast.show({ title: "저장되었습니다" });
toast.success("업로드 완료");`}
  >
    <ClientOnly>
      <RNToastProvider>
        <RNDemo />
      </RNToastProvider>
    </ClientOnly>
  </Example>
);

export default function ToastPage() {
  return (
    <ComponentDoc title="Toast" lead="잠깐 떴다 사라지는 알림. 명령형 useToast() API로 띄웁니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

> Step 0에서 본 card 페이지의 import 경로/`Tabs` props(`ariaLabel`, `items` `{id,label,content}`)와 정확히 일치시킬 것. 다르면 card 페이지에 맞춤.

- [ ] **Step 4: 빌드 확인**

먼저 패키지 dist 최신화: `pnpm --filter @superbase/react build && pnpm --filter @superbase/react-native build`
그다음: `pnpm --filter @superbase/docs build && pnpm --filter @superbase/docs test`
Expected: 성공 — `/components/toast` 정적 빌드, componentNav 테스트 통과.

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/components/docs/componentNav.ts apps/docs/components/docs/componentNav.test.ts apps/docs/app/components/toast/page.tsx
git commit -m "docs: add Toast page + nav entry"
```

---

## Task 11: changeset + 전체 검증

**Files:**
- Create: `.changeset/phase3c-toast.md`

- [ ] **Step 1: changeset 작성**

`.changeset/phase3c-toast.md`:

```markdown
---
"@superbase/tokens": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

Add Toast notifications with an imperative ToastProvider/useToast API (show/success/error/warning/info/dismiss) for web and React Native. Auto-dismiss, stacking, action button, and bottom-center placement. New token: toast width size.
```

- [ ] **Step 2: 전체 검증**

Run: `pnpm turbo run typecheck test build --force`
Expected: 전 패키지 PASS. 테스트 증가(react +~12, react-native +~9, tokens +1). docs 빌드에 `/components/toast` 포함.

- [ ] **Step 3: 헤드리스 시각검수(웹)**

docs를 `next start`로 띄우고 헤드리스 Chrome(CDP)로 `/components/toast` 접속 → "기본"/"error"/"action" 버튼 클릭 → 토스트(하단중앙, 아이콘 색, 닫기/액션 버튼, 스택) 캡처 확인. RN 탭도 동일 확인.

- [ ] **Step 4: 커밋**

```bash
git add .changeset/phase3c-toast.md
git commit -m "chore: changeset for Phase 3c Toast"
```

---

## Self-Review 메모(작성자 검증)

- **Spec 커버리지**: 토큰(size.toast)=T1 / 웹(types·context·useToast=T2, item+CSS=T3, provider+lifecycle=T4, export=T5) / RN(T6·T7·T8·T9) / 문서+nav=T10 / changeset+검증=T11. a11y(status/alert, region) T3·T4 반영. 자동다스미스·sticky·action·close·stack 테스트 T4/T8. 누락 없음. (hover-pause·스택상한·swipe는 spec에서 유예 → 플랜 제외 정상.)
- **타입 일관성**: `ToastVariant`/`ToastOptions`/`ToastData`/`ToastApi` web/RN 동일(차이는 `ToastAction`의 `onClick`(web) vs `onPress`(RN) — 의도적). `ToastItemProps {toast,onDismiss}` 양쪽 동일. `VARIANT_ICON` 동일. `DEFAULT_DURATION=4000`/`EXIT_MS=120` 양쪽 동일. provider api(make 헬퍼)·nextId 동일. `t.size.toast`(RN) ↔ `--size-toast`(web) ↔ themeDts `toast:number` 일치. status 색 `t.color.status[variant]`(RN) ↔ `--color-status-*`(web CSS).
- **플레이스홀더**: 없음(모든 step에 코드/명령/기대값).
- **검증 가정(구현 중 확인)**: ① RN 토스트 role은 `role` prop 사용(accessibilityRole엔 status 없음); RN0.86 타입에서 막히면 T7 주석대로 완화. ② RNW `getByLabelText("Close")` 안 되면 `getByRole` 조정. ③ docs RN Button=`onPress`(확인됨). ④ tokens 스냅샷 `-u`.
