# Phase 3b — Overlay Infra + Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 웹 오버레이 인프라(Portal/focus-trap/scroll-lock/escape, 자체 구현)와 Modal/Dialog(compound-lite, web + RN)를 추가한다.

**Architecture:** 웹은 `createPortal` + 자체 hook(focus-trap/scroll-lock/escape)으로 인프라를 만들고 그 위에 compound `Modal`(+`ModalHeader`/`ModalBody`/`ModalFooter`)을 올린다. RN은 네이티브 `Modal`을 래핑한다. 신규 토큰은 scrim 색 + modal 너비(sm/md/lg)만. 전부 추가만 → breaking 없음.

**Tech Stack:** React 19, TypeScript, CSS Modules(웹), react-native(+react-native-web로 헤드리스 테스트), Style Dictionary 토큰, vitest, changesets.

**Spec:** `docs/superpowers/specs/2026-06-22-phase3b-overlay-modal-design.md`

**전역 규약(기존 패턴 준수):**
- 컴포넌트는 `forwardRef`. 웹 ref는 구체 HTML 요소, RN ref는 `ElementRef<typeof View>`.
- 웹은 CSS Module + 토큰 CSS 변수(`var(--token)`), RN은 `useTheme()` 런타임 테마.
- RN 테스트는 ThemeProvider 없이 라이트로 통과해야 함(하위호환).
- 신규 컴포넌트 추가 시 **컴포넌트+테스트를 폴더 단위로 커밋**(과거 단일 파일 add로 테스트 누락된 교훈).
- 각 패키지 테스트: `pnpm --filter @superbase/<pkg> test`. 전체: `pnpm turbo run typecheck test build`.

**파일 구조 개요:**
- 토큰: `packages/tokens/src/{semantic.light.json,semantic.dark.json,sizing.json}` 수정, `packages/tokens/build.mjs`(themeDts 타입) 수정.
- 웹 인프라: `packages/react/src/overlay/{Portal.tsx,useScrollLock.ts,useFocusTrap.ts,useEscapeKey.ts}` (+ 각 `.test.tsx`).
- 웹 Modal: `packages/react/src/Modal/{ModalContext.ts,Modal.tsx,ModalHeader.tsx,ModalBody.tsx,ModalFooter.tsx,Modal.module.css,Modal.test.tsx}` + `index.ts`.
- RN Modal: `packages/react-native/src/Modal/{ModalContext.ts,Modal.tsx,ModalHeader.tsx,ModalBody.tsx,ModalFooter.tsx,Modal.test.tsx}` + `index.ts`.
- 문서: `apps/docs/app/components/modal/page.tsx`, `apps/docs/components/docs/componentNav.ts` + `componentNav.test.ts`.
- changeset: `.changeset/*.md`.

---

## Task 1: 토큰 — scrim 색 + modal 너비

**Files:**
- Modify: `packages/tokens/src/semantic.light.json` (background에 scrim)
- Modify: `packages/tokens/src/semantic.dark.json` (background에 scrim)
- Modify: `packages/tokens/src/sizing.json` (size에 modal)
- Modify: `packages/tokens/build.mjs:91,120-131` (themeDts: background.scrim, size.modal)
- Test: `packages/tokens/test/build.test.ts`

- [ ] **Step 1: build 출력 단언 테스트 추가(실패 예상)**

`packages/tokens/test/build.test.ts`의 `describe("token build outputs", ...)` 안에 새 `it` 추가:

```typescript
it("emits scrim color and modal size tokens", () => {
  const css = readFileSync(join(dist, "web/variables.css"), "utf8");
  expect(css).toContain("--color-background-scrim:");
  expect(css).toContain("--size-modal-sm: 360px;");
  expect(css).toContain("--size-modal-md: 480px;");
  expect(css).toContain("--size-modal-lg: 640px;");

  const theme = readFileSync(join(dist, "native/theme.js"), "utf8");
  expect(theme).toContain('"scrim"');
  expect(theme).toContain('"modal"');
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/tokens test -- build.test`
Expected: FAIL — `--color-background-scrim` / `--size-modal-sm` 미존재.

- [ ] **Step 3: 토큰 소스에 값 추가**

`packages/tokens/src/semantic.light.json` — `color.background` 객체를 다음으로 교체:

```json
    "background": {
      "default": { "value": "{color.white}" },
      "subtle":  { "value": "{color.gray.50}" },
      "scrim":   { "value": "rgba(0, 0, 0, 0.5)" }
    },
```

`packages/tokens/src/semantic.dark.json` — `color.background` 객체를 다음으로 교체:

```json
    "background": {
      "default": { "value": "{color.gray.900}" },
      "subtle":  { "value": "{color.gray.800}" },
      "scrim":   { "value": "rgba(0, 0, 0, 0.6)" }
    },
```

`packages/tokens/src/sizing.json` — `size` 객체의 마지막 `avatar` 블록 뒤(닫는 `}` 앞)에 `modal` 추가. 즉 `avatar` 블록 끝의 `}` 뒤에 `,`를 붙이고:

```json
    "modal": {
      "sm": { "value": "360px" },
      "md": { "value": "480px" },
      "lg": { "value": "640px" }
    }
```

- [ ] **Step 4: themeDts 타입 갱신**

`packages/tokens/build.mjs`의 `themeDts()` 안에서:

`background: { default: string; subtle: string };` → 다음으로 교체:

```javascript
    background: { default: string; subtle: string; scrim: string };
```

그리고 `size:` 블록의 `avatar: { sm: number; md: number; lg: number };` 줄 뒤에 추가:

```javascript
    modal: { sm: number; md: number; lg: number };
```

- [ ] **Step 5: 테스트 실행해 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS (스냅샷 변화가 있으면 `pnpm --filter @superbase/tokens test -- -u`로 갱신 후 diff 확인 — scrim/modal 항목만 추가됐는지).

- [ ] **Step 6: 토큰 빌드해 dist 갱신(다른 패키지가 소비)**

Run: `pnpm --filter @superbase/tokens build`
Expected: 성공. `packages/tokens/dist/web/variables.css`에 `--color-background-scrim`/`--size-modal-*` 존재 확인.

- [ ] **Step 7: 커밋**

```bash
git add packages/tokens/src packages/tokens/build.mjs packages/tokens/test packages/tokens/dist
git commit -m "feat(tokens): add scrim color + modal size tokens"
```

---

## Task 2: 웹 인프라 — Portal

**Files:**
- Create: `packages/react/src/overlay/Portal.tsx`
- Test: `packages/react/src/overlay/Portal.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/overlay/Portal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Portal } from "./Portal";

describe("Portal", () => {
  it("renders children into document.body", () => {
    render(
      <div data-testid="host">
        <Portal>
          <span>portaled</span>
        </Portal>
      </div>,
    );
    const portaled = screen.getByText("portaled");
    expect(portaled).toBeInTheDocument();
    // children land on body, not inside the host wrapper
    expect(screen.getByTestId("host").contains(portaled)).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- Portal`
Expected: FAIL — `./Portal` 모듈 없음.

- [ ] **Step 3: 구현**

`packages/react/src/overlay/Portal.tsx`:

```tsx
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: ReactNode;
}

/** Renders children into document.body. SSR-safe: nothing until mounted. */
export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react test -- Portal`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add packages/react/src/overlay/Portal.tsx packages/react/src/overlay/Portal.test.tsx
git commit -m "feat(react): add overlay Portal primitive"
```

---

## Task 3: 웹 인프라 — useScrollLock

**Files:**
- Create: `packages/react/src/overlay/useScrollLock.ts`
- Test: `packages/react/src/overlay/useScrollLock.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/overlay/useScrollLock.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { useScrollLock } from "./useScrollLock";

function Lock({ active }: { active: boolean }) {
  useScrollLock(active);
  return null;
}

describe("useScrollLock", () => {
  it("locks documentElement overflow while active and restores after", () => {
    const { rerender, unmount } = render(<Lock active={false} />);
    expect(document.documentElement.style.overflow).toBe("");

    rerender(<Lock active={true} />);
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(<Lock active={false} />);
    expect(document.documentElement.style.overflow).toBe("");

    unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("stays locked until the last active consumer releases (ref count)", () => {
    const a = render(<Lock active={true} />);
    const b = render(<Lock active={true} />);
    expect(document.documentElement.style.overflow).toBe("hidden");

    a.unmount();
    expect(document.documentElement.style.overflow).toBe("hidden"); // b still active

    b.unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- useScrollLock`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

`packages/react/src/overlay/useScrollLock.ts`:

```ts
import { useEffect } from "react";

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

function lock() {
  if (lockCount === 0) {
    const el = document.documentElement;
    const scrollbarWidth = window.innerWidth - el.clientWidth;
    savedOverflow = el.style.overflow;
    savedPaddingRight = el.style.paddingRight;
    el.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(el).paddingRight) || 0;
      el.style.paddingRight = `${current + scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const el = document.documentElement;
    el.style.overflow = savedOverflow;
    el.style.paddingRight = savedPaddingRight;
  }
}

/** Locks body scroll while `active`. Ref-counted across nested overlays. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react test -- useScrollLock`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add packages/react/src/overlay/useScrollLock.ts packages/react/src/overlay/useScrollLock.test.tsx
git commit -m "feat(react): add useScrollLock (ref-counted)"
```

---

## Task 4: 웹 인프라 — useFocusTrap

**Files:**
- Create: `packages/react/src/overlay/useFocusTrap.ts`
- Test: `packages/react/src/overlay/useFocusTrap.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/overlay/useFocusTrap.test.tsx`:

```tsx
import { useRef } from "react";
import { render } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

function Trapped({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div>
      <button data-testid="outside">outside</button>
      <div ref={ref}>
        <button data-testid="first">first</button>
        <button data-testid="last">last</button>
      </div>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("moves focus into the container when activated", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    const { getByTestId } = render(<Trapped active={true} />);
    expect(document.activeElement).toBe(getByTestId("first"));
    document.body.removeChild(outside);
  });

  it("restores focus to the previously focused element when deactivated", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();

    const { rerender } = render(<Trapped active={true} />);
    rerender(<Trapped active={false} />);
    expect(document.activeElement).toBe(outside);
    document.body.removeChild(outside);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- useFocusTrap`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

`packages/react/src/overlay/useFocusTrap.ts`:

```ts
import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/** Traps Tab focus within `containerRef` while `active`; restores focus on release. */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const items = focusable(container);
    (items[0] ?? container).focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const current = focusable(container!);
      if (current.length === 0) {
        e.preventDefault();
        return;
      }
      const first = current[0];
      const last = current[current.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [containerRef, active]);
}
```

> 참고: 컨테이너 자체에 포커스가 가려면 `tabIndex={-1}`가 필요 — Modal 패널에 부여한다(Task 6).

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react test -- useFocusTrap`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add packages/react/src/overlay/useFocusTrap.ts packages/react/src/overlay/useFocusTrap.test.tsx
git commit -m "feat(react): add useFocusTrap"
```

---

## Task 5: 웹 인프라 — useEscapeKey

**Files:**
- Create: `packages/react/src/overlay/useEscapeKey.ts`
- Test: `packages/react/src/overlay/useEscapeKey.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/overlay/useEscapeKey.test.tsx`:

```tsx
import { render, fireEvent } from "@testing-library/react";
import { useEscapeKey } from "./useEscapeKey";

function Esc({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  useEscapeKey(active, onEscape);
  return null;
}

describe("useEscapeKey", () => {
  it("calls handler on Escape while active", () => {
    const onEscape = vi.fn();
    render(<Esc active={true} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does nothing when inactive", () => {
    const onEscape = vi.fn();
    render(<Esc active={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- useEscapeKey`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

`packages/react/src/overlay/useEscapeKey.ts`:

```ts
import { useEffect } from "react";

/** Calls `handler` when Escape is pressed while `active`. */
export function useEscapeKey(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handler();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handler]);
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/react test -- useEscapeKey`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add packages/react/src/overlay/useEscapeKey.ts packages/react/src/overlay/useEscapeKey.test.tsx
git commit -m "feat(react): add useEscapeKey"
```

---

## Task 6: 웹 Modal — Context + root + CSS

**Files:**
- Create: `packages/react/src/Modal/ModalContext.ts`
- Create: `packages/react/src/Modal/Modal.tsx`
- Create: `packages/react/src/Modal/Modal.module.css`
- Test: `packages/react/src/Modal/Modal.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/Modal/Modal.test.tsx`:

```tsx
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} onClose={() => {}} aria-label="dlg">body</Modal>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a dialog with aria-modal when open", () => {
    render(<Modal open onClose={() => {}} aria-label="dlg">body</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "dlg");
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg">body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeOnEscape=false", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} closeOnEscape={false} aria-label="dlg">body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on backdrop click but not on panel click", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg">body</Modal>);
    fireEvent.click(screen.getByText("body")); // panel content
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on backdrop click when closeOnBackdropClick=false", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} closeOnBackdropClick={false} aria-label="dlg">body</Modal>);
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies size via data-size", () => {
    render(<Modal open onClose={() => {}} size="lg" aria-label="dlg">body</Modal>);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-size", "lg");
  });

  it("forwards ref to the panel", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal open onClose={() => {}} ref={ref} aria-label="dlg">body</Modal>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "dialog");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- Modal`
Expected: FAIL — `./Modal` 모듈 없음.

- [ ] **Step 3: ModalContext 구현**

`packages/react/src/Modal/ModalContext.ts`:

```ts
import { createContext, useContext } from "react";

export interface ModalContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal subcomponents must be used within <Modal>");
  return ctx;
}
```

- [ ] **Step 4: Modal 구현**

`packages/react/src/Modal/Modal.tsx`:

```tsx
import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../overlay/Portal";
import { useFocusTrap } from "../overlay/useFocusTrap";
import { useScrollLock } from "../overlay/useScrollLock";
import { useEscapeKey } from "../overlay/useEscapeKey";
import { ModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    size = "md",
    closeOnBackdropClick = true,
    closeOnEscape = true,
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useScrollLock(open);
  useFocusTrap(panelRef, open);
  useEscapeKey(open && closeOnEscape, onClose);

  if (!open) return null;

  return (
    <ModalContext.Provider
      value={{ onClose, titleId, descriptionId, registerTitle: setHasTitle, registerDescription: setHasDescription }}
    >
      <Portal>
        <div
          data-testid="modal-scrim"
          className={styles.scrim}
          role="presentation"
          onClick={(e) => {
            if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
          }}
        >
          <div
            ref={setPanel}
            role="dialog"
            aria-modal="true"
            aria-label={hasTitle ? undefined : ariaLabel}
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasDescription ? descriptionId : undefined}
            data-size={size}
            tabIndex={-1}
            className={[styles.panel, className].filter(Boolean).join(" ")}
            {...rest}
          >
            {children}
          </div>
        </div>
      </Portal>
    </ModalContext.Provider>
  );
});
```

- [ ] **Step 5: CSS Module 작성**

`packages/react/src/Modal/Modal.module.css`:

```css
.scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-index-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background: var(--color-background-scrim);
  animation: sb-modal-fade var(--duration-fast) var(--easing-standard);
}

.panel {
  position: relative;
  z-index: var(--z-index-modal);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - var(--spacing-8));
  background: var(--color-background-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  outline: none;
  animation: sb-modal-pop var(--duration-base) var(--easing-decelerate);
}

.panel[data-size="sm"] { max-width: var(--size-modal-sm); }
.panel[data-size="md"] { max-width: var(--size-modal-md); }
.panel[data-size="lg"] { max-width: var(--size-modal-lg); }

@keyframes sb-modal-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sb-modal-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm --filter @superbase/react test -- Modal`
Expected: PASS (8 테스트).

- [ ] **Step 7: 커밋**

```bash
git add packages/react/src/Modal/ModalContext.ts packages/react/src/Modal/Modal.tsx packages/react/src/Modal/Modal.module.css packages/react/src/Modal/Modal.test.tsx
git commit -m "feat(react): add Modal root + overlay wiring"
```

---

## Task 7: 웹 Modal — Header / Body / Footer (compound + a11y)

**Files:**
- Create: `packages/react/src/Modal/ModalHeader.tsx`
- Create: `packages/react/src/Modal/ModalBody.tsx`
- Create: `packages/react/src/Modal/ModalFooter.tsx`
- Modify: `packages/react/src/Modal/Modal.module.css` (header/body/footer 스타일)
- Modify: `packages/react/src/Modal/Modal.test.tsx` (compound 테스트 추가)

- [ ] **Step 1: 실패 테스트 추가**

`packages/react/src/Modal/Modal.test.tsx`에 새 describe 추가:

```tsx
import { Modal as M } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";

describe("Modal compound", () => {
  it("wires the header title to aria-labelledby", () => {
    render(
      <M open onClose={() => {}}>
        <ModalHeader>제목</ModalHeader>
        <ModalBody>내용</ModalBody>
      </M>,
    );
    const dialog = screen.getByRole("dialog");
    const labelledby = dialog.getAttribute("aria-labelledby");
    expect(labelledby).toBeTruthy();
    expect(document.getElementById(labelledby!)?.textContent).toBe("제목");
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("renders a close button that calls onClose", () => {
    const onClose = vi.fn();
    render(
      <M open onClose={onClose}>
        <ModalHeader>제목</ModalHeader>
      </M>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the close button when showCloseButton=false", () => {
    render(
      <M open onClose={() => {}}>
        <ModalHeader showCloseButton={false}>제목</ModalHeader>
      </M>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("renders footer content", () => {
    render(
      <M open onClose={() => {}} aria-label="dlg">
        <ModalFooter><button>확인</button></ModalFooter>
      </M>,
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- Modal`
Expected: FAIL — Header/Body/Footer 모듈 없음.

- [ ] **Step 3: ModalHeader 구현**

`packages/react/src/Modal/ModalHeader.tsx`:

```tsx
import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { useModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export interface ModalHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  showCloseButton?: boolean;
}

export function ModalHeader({ children, showCloseButton = true, className, ...rest }: ModalHeaderProps) {
  const { titleId, onClose, registerTitle } = useModalContext();
  useEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);

  return (
    <header className={[styles.header, className].filter(Boolean).join(" ")} {...rest}>
      <h2 id={titleId} className={styles.title}>
        {children}
      </h2>
      {showCloseButton && (
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <Icon name="close" size="sm" />
        </button>
      )}
    </header>
  );
}
```

- [ ] **Step 4: ModalBody 구현**

`packages/react/src/Modal/ModalBody.tsx`:

```tsx
import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { useModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ModalBody({ children, className, ...rest }: ModalBodyProps) {
  const { descriptionId, registerDescription } = useModalContext();
  useEffect(() => {
    registerDescription(true);
    return () => registerDescription(false);
  }, [registerDescription]);

  return (
    <div id={descriptionId} className={[styles.body, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: ModalFooter 구현**

`packages/react/src/Modal/ModalFooter.tsx`:

```tsx
import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Modal.module.css";

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ModalFooter({ children, className, ...rest }: ModalFooterProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: CSS에 header/body/footer 스타일 추가**

`packages/react/src/Modal/Modal.module.css` 끝에 추가:

```css
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-5) var(--spacing-5) var(--spacing-3);
}
.title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-title);
}
.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.close:hover { background: var(--color-background-subtle); }
.close:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.body {
  padding: 0 var(--spacing-5);
  overflow-y: auto;
  color: var(--color-text-secondary);
}
.body:first-child { padding-top: var(--spacing-5); }
.body:last-child { padding-bottom: var(--spacing-5); }
.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5) var(--spacing-5);
}
```

- [ ] **Step 7: 통과 확인**

Run: `pnpm --filter @superbase/react test -- Modal`
Expected: PASS (Modal 8 + compound 4).

- [ ] **Step 8: 커밋**

```bash
git add packages/react/src/Modal/ModalHeader.tsx packages/react/src/Modal/ModalBody.tsx packages/react/src/Modal/ModalFooter.tsx packages/react/src/Modal/Modal.module.css packages/react/src/Modal/Modal.test.tsx
git commit -m "feat(react): add ModalHeader/Body/Footer (compound + a11y)"
```

---

## Task 8: 웹 — index.ts export

**Files:**
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react/src/index.ts` 끝에 추가:

```ts
export { Modal } from "./Modal/Modal";
export type { ModalProps, ModalSize } from "./Modal/Modal";
export { ModalHeader } from "./Modal/ModalHeader";
export type { ModalHeaderProps } from "./Modal/ModalHeader";
export { ModalBody } from "./Modal/ModalBody";
export type { ModalBodyProps } from "./Modal/ModalBody";
export { ModalFooter } from "./Modal/ModalFooter";
export type { ModalFooterProps } from "./Modal/ModalFooter";
```

- [ ] **Step 2: 빌드 + 타입체크 확인**

Run: `pnpm --filter @superbase/react typecheck && pnpm --filter @superbase/react build`
Expected: 성공. `packages/react/dist`에 Modal 타입 포함.

- [ ] **Step 3: 커밋**

```bash
git add packages/react/src/index.ts
git commit -m "feat(react): export Modal components"
```

---

## Task 9: RN Modal — Context + root

**Files:**
- Create: `packages/react-native/src/Modal/ModalContext.ts`
- Create: `packages/react-native/src/Modal/Modal.tsx`
- Test: `packages/react-native/src/Modal/Modal.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react-native/src/Modal/Modal.test.tsx`:

```tsx
import { createRef } from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal (RN)", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} onClose={() => {}} aria-label="dlg"><Text>body</Text></Modal>);
    expect(screen.queryByText("body")).toBeNull();
  });

  it("renders content when open", () => {
    render(<Modal open onClose={() => {}} aria-label="dlg"><Text>body</Text></Modal>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("calls onClose when the scrim is pressed", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg"><Text>body</Text></Modal>);
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on scrim press when closeOnBackdropClick=false", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} closeOnBackdropClick={false} aria-label="dlg"><Text>body</Text></Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = createRef<unknown>();
    render(<Modal open onClose={() => {}} ref={ref as never} aria-label="dlg"><Text>body</Text></Modal>);
    expect(ref.current).not.toBeNull();
  });
});
```

> 주: RNW Modal은 `visible`일 때 children을 DOM에 렌더하므로 `@testing-library/react`로 검증 가능. 패널 자체 press는 scrim으로 버블되지 않아야 함(아래 패널 Pressable이 전파 차단).

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- Modal`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: ModalContext 구현**

`packages/react-native/src/Modal/ModalContext.ts`:

```ts
import { createContext, useContext } from "react";

export interface ModalContextValue {
  onClose: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal subcomponents must be used within <Modal>");
  return ctx;
}
```

- [ ] **Step 4: Modal 구현**

`packages/react-native/src/Modal/Modal.tsx`:

```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { Modal as RNModal, Pressable, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { ModalContext } from "./ModalContext";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  "aria-label"?: string;
}

export const Modal = forwardRef<ElementRef<typeof View>, ModalProps>(function Modal(
  { open, onClose, size = "md", closeOnBackdropClick = true, closeOnEscape = true, children, "aria-label": ariaLabel },
  ref,
) {
  const t = useTheme();
  const maxWidth = t.size.modal[size];

  return (
    <RNModal
      transparent
      visible={open}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => closeOnEscape && onClose()}
    >
      <Pressable
        testID="modal-scrim"
        accessibilityLabel="modal-scrim"
        onPress={() => closeOnBackdropClick && onClose()}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: t.spacing["4"],
          backgroundColor: t.color.background.scrim,
        }}
      >
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth }}>
          <View
            ref={ref}
            accessibilityViewIsModal
            accessibilityLabel={ariaLabel}
            style={{
              backgroundColor: t.color.background.default,
              borderRadius: t.radius.lg,
              ...t.shadow.lg,
            }}
          >
            <ModalContext.Provider value={{ onClose }}>{children}</ModalContext.Provider>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
});
```

> 주: 안쪽 `Pressable`(onPress 빈 함수)은 패널 영역 탭이 scrim으로 전파돼 닫히는 것을 막는다.

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- Modal`
Expected: PASS (5 테스트). 만약 RNW Modal이 `testID`를 다른 곳에 두면 `accessibilityLabel`로 쿼리하도록 테스트 조정.

- [ ] **Step 6: 커밋**

```bash
git add packages/react-native/src/Modal/ModalContext.ts packages/react-native/src/Modal/Modal.tsx packages/react-native/src/Modal/Modal.test.tsx
git commit -m "feat(react-native): add Modal root (native Modal wrapper)"
```

---

## Task 10: RN Modal — Header / Body / Footer

**Files:**
- Create: `packages/react-native/src/Modal/ModalHeader.tsx`
- Create: `packages/react-native/src/Modal/ModalBody.tsx`
- Create: `packages/react-native/src/Modal/ModalFooter.tsx`
- Modify: `packages/react-native/src/Modal/Modal.test.tsx`

- [ ] **Step 1: 실패 테스트 추가**

`packages/react-native/src/Modal/Modal.test.tsx`에 추가:

```tsx
import { Modal as M } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";
import { Text as RNText } from "react-native";

describe("Modal compound (RN)", () => {
  it("renders header title and a close button that calls onClose", () => {
    const onClose = vi.fn();
    render(
      <M open onClose={onClose}>
        <ModalHeader>제목</ModalHeader>
      </M>,
    );
    expect(screen.getByText("제목")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides close button when showCloseButton=false", () => {
    render(
      <M open onClose={() => {}}>
        <ModalHeader showCloseButton={false}>제목</ModalHeader>
      </M>,
    );
    expect(screen.queryByLabelText("Close")).toBeNull();
  });

  it("renders body and footer", () => {
    render(
      <M open onClose={() => {}} aria-label="dlg">
        <ModalBody><RNText>내용</RNText></ModalBody>
        <ModalFooter><RNText>확인</RNText></ModalFooter>
      </M>,
    );
    expect(screen.getByText("내용")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- Modal`
Expected: FAIL — Header/Body/Footer 없음.

- [ ] **Step 3: ModalHeader 구현**

`packages/react-native/src/Modal/ModalHeader.tsx`:

```tsx
import type { ReactNode } from "react";
import { View, Text as RNText, Pressable } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { useModalContext } from "./ModalContext";

export interface ModalHeaderProps {
  children: ReactNode;
  showCloseButton?: boolean;
}

export function ModalHeader({ children, showCloseButton = true }: ModalHeaderProps) {
  const t = useTheme();
  const { onClose } = useModalContext();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: t.spacing["3"],
        paddingHorizontal: t.spacing["5"],
        paddingTop: t.spacing["5"],
        paddingBottom: t.spacing["3"],
      }}
    >
      <RNText
        style={{ flex: 1, fontSize: t.font.size.title, fontWeight: String(t.font.weight.bold) as never, color: t.color.text.primary }}
      >
        {children}
      </RNText>
      {showCloseButton && (
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
          <Icon name="close" size="sm" />
        </Pressable>
      )}
    </View>
  );
}
```

- [ ] **Step 4: ModalBody 구현**

`packages/react-native/src/Modal/ModalBody.tsx`:

```tsx
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  const t = useTheme();
  return (
    <ScrollView style={{ paddingHorizontal: t.spacing["5"], paddingVertical: t.spacing["2"] }}>
      {children}
    </ScrollView>
  );
}
```

- [ ] **Step 5: ModalFooter 구현**

`packages/react-native/src/Modal/ModalFooter.tsx`:

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: t.spacing["2"],
        paddingHorizontal: t.spacing["5"],
        paddingTop: t.spacing["3"],
        paddingBottom: t.spacing["5"],
      }}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- Modal`
Expected: PASS.

> 만약 ScrollView가 jsdom에서 경고를 내면 무시(렌더는 됨). `getByLabelText("Close")`가 RNW에서 `aria-label`로 매핑되는지 확인 — 안 되면 `getByRole("button", { name: "Close" })`로 조정.

- [ ] **Step 7: 커밋**

```bash
git add packages/react-native/src/Modal/ModalHeader.tsx packages/react-native/src/Modal/ModalBody.tsx packages/react-native/src/Modal/ModalFooter.tsx packages/react-native/src/Modal/Modal.test.tsx
git commit -m "feat(react-native): add ModalHeader/Body/Footer"
```

---

## Task 11: RN — index.ts export

**Files:**
- Modify: `packages/react-native/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react-native/src/index.ts` 끝에 추가:

```ts
export { Modal } from "./Modal/Modal";
export type { ModalProps, ModalSize } from "./Modal/Modal";
export { ModalHeader } from "./Modal/ModalHeader";
export type { ModalHeaderProps } from "./Modal/ModalHeader";
export { ModalBody } from "./Modal/ModalBody";
export type { ModalBodyProps } from "./Modal/ModalBody";
export { ModalFooter } from "./Modal/ModalFooter";
export type { ModalFooterProps } from "./Modal/ModalFooter";
```

- [ ] **Step 2: 빌드 + 타입체크 확인**

Run: `pnpm --filter @superbase/react-native typecheck && pnpm --filter @superbase/react-native build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add packages/react-native/src/index.ts
git commit -m "feat(react-native): export Modal components"
```

---

## Task 12: 문서 — Modal 페이지 + nav

**Files:**
- Modify: `apps/docs/components/docs/componentNav.ts`
- Modify: `apps/docs/components/docs/componentNav.test.ts`
- Create: `apps/docs/app/components/modal/page.tsx`

- [ ] **Step 1: nav.test 카운트 갱신(실패 예상)**

`apps/docs/components/docs/componentNav.test.ts`:
- `expect(componentNav).toHaveLength(13);` → `toHaveLength(14);`
- assertion 추가: `expect(componentNav.map((c) => c.slug)).toContain("modal");`

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/docs test -- componentNav` (docs에 test 스크립트 없으면 이 스텝 생략하고 Step 3로)
Expected: FAIL — modal 미존재 / 길이 13.

- [ ] **Step 3: nav 항목 추가**

`apps/docs/components/docs/componentNav.ts`의 `componentNav` 배열에서 알파벳 순 위치(`icon` 다음, `radio` 앞)에 추가:

```ts
  { slug: "modal", label: "Modal" },
```

- [ ] **Step 4: Modal 페이지 작성**

`apps/docs/app/components/modal/page.tsx` (기존 card 페이지 패턴 그대로 — `"use client"` + 토글 버튼으로 라이브 데모):

```tsx
"use client";
import { useState } from "react";
import {
  Modal as WebModal,
  ModalHeader as WebModalHeader,
  ModalBody as WebModalBody,
  ModalFooter as WebModalFooter,
  Button as WebButton,
  Text as WebText,
} from "@superbase/react";
import {
  Modal as RNModal,
  ModalHeader as RNModalHeader,
  ModalBody as RNModalBody,
  ModalFooter as RNModalFooter,
  Button as RNButton,
  Text as RNText,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

function WebDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <WebButton onClick={() => setOpen(true)}>모달 열기</WebButton>
      <WebModal open={open} onClose={() => setOpen(false)} size="md">
        <WebModalHeader>약관 동의</WebModalHeader>
        <WebModalBody>
          <WebText color="secondary">계속하려면 약관에 동의해 주세요.</WebText>
        </WebModalBody>
        <WebModalFooter>
          <WebButton variant="ghost" onClick={() => setOpen(false)}>취소</WebButton>
          <WebButton onClick={() => setOpen(false)}>동의</WebButton>
        </WebModalFooter>
      </WebModal>
    </>
  );
}

function RNDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RNButton onClick={() => setOpen(true)}>모달 열기</RNButton>
      <RNModal open={open} onClose={() => setOpen(false)} size="md">
        <RNModalHeader>약관 동의</RNModalHeader>
        <RNModalBody>
          <RNText color="secondary">계속하려면 약관에 동의해 주세요.</RNText>
        </RNModalBody>
        <RNModalFooter>
          <RNButton variant="ghost" onClick={() => setOpen(false)}>취소</RNButton>
          <RNButton onClick={() => setOpen(false)}>동의</RNButton>
        </RNModalFooter>
      </RNModal>
    </>
  );
}

const webContent = (
  <Example
    title="기본 사용"
    description={<><Code>open</Code>/<Code>onClose</Code>로 제어하고 <Code>ModalHeader</Code>/<Code>ModalBody</Code>/<Code>ModalFooter</Code>로 구성합니다. Escape·백드롭 클릭으로 닫힙니다.</>}
    code={`<Modal open={open} onClose={close} size="md">
  <ModalHeader>약관 동의</ModalHeader>
  <ModalBody>계속하려면 약관에 동의해 주세요.</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={close}>취소</Button>
    <Button onClick={close}>동의</Button>
  </ModalFooter>
</Modal>`}
  >
    <WebDemo />
  </Example>
);

const nativeContent = (
  <Example
    title="기본 사용"
    description={<>RN은 네이티브 <Code>Modal</Code>을 래핑합니다. Android 백버튼으로도 닫힙니다.</>}
    code={`<Modal open={open} onClose={close} size="md">
  <ModalHeader>약관 동의</ModalHeader>
  <ModalBody>계속하려면 약관에 동의해 주세요.</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={close}>취소</Button>
    <Button onClick={close}>동의</Button>
  </ModalFooter>
</Modal>`}
  >
    <ClientOnly>
      <RNDemo />
    </ClientOnly>
  </Example>
);

export default function ModalPage() {
  return (
    <ComponentDoc title="Modal" lead="화면 위에 띄우는 대화상자. 포커스 트랩·스크롤 락·Escape/백드롭 닫기를 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

> RN Button의 prop이 `onClick`이 아니라 `onPress`이면 위 데모의 `onClick`을 `onPress`로 바꿀 것. (구현 시 `packages/react-native/src/Button/Button.tsx`의 prop명을 확인해 맞춘다 — 기존 docs 페이지에서 RN Button을 어떻게 호출하는지 참고.)

- [ ] **Step 5: nav.test 통과 + docs 빌드 확인**

Run: `pnpm --filter @superbase/docs build`
Expected: 성공. `/components/modal` 라우트가 정적 빌드됨. (nav.test가 있으면 함께 통과.)

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/components/docs/componentNav.ts apps/docs/components/docs/componentNav.test.ts apps/docs/app/components/modal/page.tsx
git commit -m "docs: add Modal page + nav entry"
```

---

## Task 13: changeset + 전체 검증

**Files:**
- Create: `.changeset/phase3b-overlay-modal.md`

- [ ] **Step 1: changeset 작성**

`.changeset/phase3b-overlay-modal.md`:

```markdown
---
"@superbase/tokens": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

Add overlay infrastructure (Portal/focus-trap/scroll-lock/escape) and Modal/Dialog (compound: Modal + ModalHeader/ModalBody/ModalFooter) for web and React Native. New tokens: background scrim color and modal width sizes (sm/md/lg).
```

- [ ] **Step 2: 전체 검증**

Run: `pnpm turbo run typecheck test build --force`
Expected: 전 패키지 PASS. 테스트 수 증가(react +~12, react-native +~8, tokens +1). docs 빌드에 `/components/modal` 포함.

- [ ] **Step 3: 헤드리스 시각검수(웹)**

docs를 dev로 띄우고(또는 빌드 산출물) 헤드리스 Chrome로 `/components/modal` 접속 → "모달 열기" 클릭 → 모달(scrim + 패널 + 헤더/바디/푸터) 캡처해 레이아웃·그림자·닫기버튼 확인. RN 탭도 동일 확인.

- [ ] **Step 4: 커밋**

```bash
git add .changeset/phase3b-overlay-modal.md
git commit -m "chore: changeset for Phase 3b overlay + Modal"
```

---

## Self-Review 메모(작성자 검증 완료)

- **Spec 커버리지**: 인프라(Portal/focus-trap/scroll-lock/escape)=Task 2–5 / 웹 Modal compound+a11y=Task 6–8 / RN Modal=Task 9–11 / 토큰(scrim+modal size)=Task 1 / 문서+nav=Task 12 / changeset+검증=Task 13. 누락 없음. (click-outside hook·exit 트랜지션은 spec에서 명시적으로 유예 → 플랜 제외 정상.)
- **타입 일관성**: `ModalSize`("sm"|"md"|"lg") web/RN 동일. `ModalContextValue`는 web(onClose+titleId+descriptionId+register×2) vs RN(onClose만) — 의도적 차이(RN은 a11y id 와이어링 단순화, spec 반영). `useModalContext` 시그니처 양쪽 일치. 토큰 `t.size.modal[size]`(RN) ↔ `--size-modal-{size}`(web) ↔ themeDts `size.modal` 일치. `t.color.background.scrim` ↔ `--color-background-scrim` ↔ themeDts `background.scrim` 일치.
- **플레이스홀더**: 없음(모든 step에 실제 코드/명령/기대값).
- **검증 필요 가정(구현 중 확인)**: ① RN Button의 핸들러 prop명(`onClick` vs `onPress`) — 기존 docs RN 사용처 참고해 맞춤(Task 12). ② RNW Modal이 `testID`/`aria-label`을 DOM에 노출하는 방식 — 쿼리 안 되면 테스트 셀렉터 조정(Task 9 주석). ③ tokens 스냅샷 변경 시 `-u` 갱신(Task 1).
