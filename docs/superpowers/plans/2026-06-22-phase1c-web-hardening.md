# Plan 1c — 웹 하드닝 (forwardRef + 토큰화 + focus-ring) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/react`(웹) 10개 컴포넌트에 `forwardRef`를 적용하고, CSS Module의 하드코딩 값(버튼 높이·컨트롤 박스·border-width·트랜지션·opacity)을 1a 신규 토큰 `var(--…)`로 교체하며, 인터랙티브 컴포넌트에 `:focus-visible` focus-ring을 일관 적용한다. docs Foundations에 신규 효과 토큰(shadow/motion 등) 시각화를 추가한다.

**Architecture:** 웹은 이미 CSS 변수 + `[data-theme]`로 런타임 테마가 되므로 RN 같은 Context는 불필요. 변경은 (a) 각 컴포넌트를 `forwardRef`로 감싸 ref 전달, (b) `.module.css`의 매직넘버를 1a 토큰 변수로 치환 + focus-ring 추가, (c) Spinner 기본 aria-label 영문화 + 색을 semantic으로, (d) docs Foundations에 효과 토큰 탭 추가.

**Tech Stack:** React 19, Vite 라이브러리 빌드, CSS Modules + 토큰 CSS 변수, Vitest + jsdom + Testing Library, Next.js 15(docs). 변경 패키지: `@superbase/react` + `apps/docs`.

> 전제: Plan 1a 머지됨 — `@superbase/tokens/css`(=docs가 import하는 variables.css)에 신규 변수 존재: `--size-button-{sm,md,lg}`(36/44/52), `--size-control`(20), `--size-field`(48), `--size-switch-{width,height,thumb}`(52/32/28), `--border-width-{thin,medium}`(1/2), `--opacity-{disabled,pressed}`(0.4/0.85), `--duration-{fast,base,slow}`, `--easing-{standard,decelerate,accelerate}`, `--focus-ring-{color,width,offset}`, `--shadow-{sm,md,lg,xl}`, `--line-height-*`. 컴포넌트 CSS는 var() 이름만 참조하고 값은 소비 앱의 variables.css에서 온다(컴포넌트 패키지 자체엔 토큰 CSS 없음 — 기존과 동일).
> 기존 공개 prop API/className 동작 유지. 기존 테스트(렌더/역할/동작)는 그대로 통과해야 한다(jsdom은 computed style 미적용이라 CSS 변경 무영향).
> 명령: `pnpm --filter @superbase/react test <path>`, `pnpm --filter @superbase/react typecheck`.

---

## Task 1: Button — forwardRef + size/opacity/transition 토큰 + focus-ring

**Files:** Rewrite `packages/react/src/Button/Button.tsx`, `packages/react/src/Button/Button.module.css`. Test: `packages/react/src/Button/Button.test.tsx`.

- [ ] **Step 1: ref 테스트 추가**

`packages/react/src/Button/Button.test.tsx` 상단 import에 `createRef`를 추가(`import { render, screen, fireEvent } from ...` 옆 React import). 없으면 `import { createRef } from "react";` 추가. describe 마지막 `});` 직전에:
```tsx
  it("forwards ref to the button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test src/Button/Button.test.tsx`
Expected: ref 케이스 FAIL(현재 forwardRef 아님 → ref.current null).

- [ ] **Step 3: Button.tsx 전체 교체**
```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", type = "button", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
});
```

- [ ] **Step 4: Button.module.css 전체 교체**
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) var(--easing-standard);
}
.button:disabled { cursor: not-allowed; opacity: var(--opacity-disabled); }
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.button[data-size="sm"] { height: var(--size-button-sm); padding: 0 var(--spacing-3); font-size: var(--font-size-caption); }
.button[data-size="md"] { height: var(--size-button-md); padding: 0 var(--spacing-4); font-size: var(--font-size-body); }
.button[data-size="lg"] { height: var(--size-button-lg); padding: 0 var(--spacing-6); font-size: var(--font-size-title); }
.button[data-variant="primary"] { background: var(--color-brand-primary); color: var(--color-white); }
.button[data-variant="primary"]:hover:not(:disabled) { background: var(--color-brand-pressed); }
.button[data-variant="secondary"] { background: var(--color-background-subtle); color: var(--color-text-primary); }
```

- [ ] **Step 5: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react test src/Button/Button.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/Button
git commit -m "feat(react): Button forwardRef + size/opacity/motion tokens + focus-ring"
```

---

## Task 2: TextField — forwardRef + field/border 토큰 + danger semantic + focus-ring

**Files:** Rewrite `packages/react/src/TextField/TextField.tsx`, `packages/react/src/TextField/TextField.module.css`. Test 기존.

- [ ] **Step 1: ref 테스트 추가**

`packages/react/src/TextField/TextField.test.tsx`에 `createRef` import 추가 후 describe 끝 직전:
```tsx
  it("forwards ref to the input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="L" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
```

- [ ] **Step 2: 실패 확인** — Run `pnpm --filter @superbase/react test src/TextField/TextField.test.tsx` → ref 케이스 FAIL.

- [ ] **Step 3: TextField.tsx 전체 교체**
```tsx
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, value, onChange, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        data-error={error ? "true" : undefined}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
});
```

- [ ] **Step 4: TextField.module.css 전체 교체**
```css
.field { display: flex; flex-direction: column; gap: var(--spacing-1); }
.label { font-size: var(--font-size-caption); color: var(--color-text-secondary); }
.input {
  height: var(--size-field);
  padding: 0 var(--spacing-4);
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  background: var(--color-background-default);
  transition: border-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}
.input:focus { outline: none; border-color: var(--color-brand-primary); }
.input:focus-visible {
  outline: none;
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}
.input[data-error="true"] { border-color: var(--color-status-danger); }
.error { font-size: var(--font-size-caption); color: var(--color-status-danger); }
```
> 변경점: `height:48px`→`--size-field`, `border:1px`→`--border-width-thin`, error 색 `--color-red-500`(primitive)→`--color-status-danger`(semantic), focus-ring box-shadow 추가.

- [ ] **Step 5: 통과 + 타입체크** — Run 위 test → PASS; `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/TextField
git commit -m "feat(react): TextField forwardRef + field/border/danger tokens + focus-ring"
```

---

## Task 3: Switch — forwardRef + switch-size/opacity 토큰 + focus-ring

**Files:** Rewrite `packages/react/src/Switch/Switch.tsx`, `packages/react/src/Switch/Switch.module.css`. Test 기존.

- [ ] **Step 1: ref 테스트 추가** (`createRef` import 후)
```tsx
  it("forwards ref to the switch button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch checked={false} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
```

- [ ] **Step 2: 실패 확인** — Run `pnpm --filter @superbase/react test src/Switch/Switch.test.tsx`.

- [ ] **Step 3: Switch.tsx 전체 교체**
```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, disabled = false, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.switch, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span className={styles.thumb} />
    </button>
  );
});
```

- [ ] **Step 4: Switch.module.css 전체 교체**
```css
.switch {
  position: relative;
  width: var(--size-switch-width);
  height: var(--size-switch-height);
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-border-default);
  cursor: pointer;
  padding: 2px;
  transition: background-color var(--duration-fast) var(--easing-standard);
}
.switch[data-checked="true"] { background: var(--color-brand-primary); }
.switch:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }
.switch:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.thumb {
  display: block;
  width: var(--size-switch-thumb);
  height: var(--size-switch-thumb);
  border-radius: var(--radius-full);
  background: var(--color-white);
  transition: transform var(--duration-fast) var(--easing-standard);
}
.switch[data-checked="true"] .thumb {
  transform: translateX(calc(var(--size-switch-width) - var(--size-switch-thumb) - 4px));
}
```
> 변경점: 치수→`--size-switch-*`, 트랙 색 `--color-gray-200`→`--color-border-default`(semantic), 트랜지션→duration/easing, disabled opacity→토큰, thumb 이동거리는 calc로 토큰 기반(52-28-4=20px), focus-ring 추가.

- [ ] **Step 5: 통과 + 타입체크** — PASS + exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/Switch
git commit -m "feat(react): Switch forwardRef + switch-size/opacity tokens + focus-ring"
```

---

## Task 4: Checkbox — forwardRef + control/border/opacity 토큰 + focus-ring

**Files:** Rewrite `packages/react/src/Checkbox/Checkbox.tsx`, `packages/react/src/Checkbox/Checkbox.module.css`. Test 기존.

- [ ] **Step 1: ref 테스트 추가** (`createRef` import 후)
```tsx
  it("forwards ref to the checkbox button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox checked={false} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
```
> 주: 현재 Checkbox는 `...rest`를 button에 펼치지만 `ref`는 props에 없음 → forwardRef로 추가해야 통과.

- [ ] **Step 2: 실패 확인** — Run `pnpm --filter @superbase/react test src/Checkbox/Checkbox.test.tsx`.

- [ ] **Step 3: Checkbox.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, onChange, disabled = false, label, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.checkbox, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span className={styles.box} aria-hidden="true">
        <span className={styles.check} />
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
});
```

- [ ] **Step 4: Checkbox.module.css 전체 교체**
```css
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.checkbox:disabled { cursor: not-allowed; opacity: var(--opacity-disabled); }
.checkbox:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-sm);
}
.box {
  width: var(--size-control);
  height: var(--size-control);
  border-radius: var(--radius-sm);
  border: var(--border-width-medium) solid var(--color-border-default);
  background: var(--color-background-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) var(--easing-standard),
    border-color var(--duration-fast) var(--easing-standard);
}
.checkbox[data-checked="true"] .box {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}
.check {
  width: calc(var(--size-control) / 2);
  height: calc(var(--size-control) / 2);
  border-radius: 1px;
  background: transparent;
}
.checkbox[data-checked="true"] .check { background: var(--color-white); }
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 5: 통과 + 타입체크** — PASS + exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/Checkbox
git commit -m "feat(react): Checkbox forwardRef + control/border/opacity tokens + focus-ring"
```

---

## Task 5: Radio + RadioGroup — forwardRef + control/border 토큰 + focus-ring

**Files:** Rewrite `packages/react/src/Radio/Radio.tsx`, `packages/react/src/Radio/RadioGroup.tsx`, `packages/react/src/Radio/Radio.module.css`. Test 기존(`Radio.test.tsx`).

- [ ] **Step 1: ref 테스트 추가** — `packages/react/src/Radio/Radio.test.tsx`에 `createRef` import 후 describe 끝 직전. Radio는 RadioGroup 안에서만 동작하므로 RadioGroup ref를 검증:
```tsx
  it("forwards ref on RadioGroup", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup value="a" ref={ref}>
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
```
> `RadioGroup`이 테스트 파일에 import돼 있지 않으면 상단 import에 추가(`import { Radio } from "./Radio"; import { RadioGroup } from "./RadioGroup";` 형태).

- [ ] **Step 2: 실패 확인** — Run `pnpm --filter @superbase/react test src/Radio/Radio.test.tsx`.

- [ ] **Step 3: Radio.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import { useRadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { value, label, disabled = false, className },
  ref,
) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.radio, className].filter(Boolean).join(" ")}
      onClick={() => group.onChange?.(value)}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
});
```

- [ ] **Step 4: RadioGroup.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import { RadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioGroupProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { value, onChange, children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <RadioContext.Provider value={{ value, onChange }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
});
```

- [ ] **Step 5: Radio.module.css 전체 교체**
```css
.group { display: flex; flex-direction: column; gap: var(--spacing-2); }
.radio {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}
.radio:disabled { cursor: not-allowed; opacity: var(--opacity-disabled); }
.radio:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-full);
}
.dot {
  width: var(--size-control);
  height: var(--size-control);
  border-radius: var(--radius-full);
  border: var(--border-width-medium) solid var(--color-border-default);
  background: var(--color-background-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--duration-fast) var(--easing-standard);
}
.radio[data-checked="true"] .dot { border-color: var(--color-brand-primary); }
.radio[data-checked="true"] .dot::after {
  content: "";
  width: calc(var(--size-control) / 2);
  height: calc(var(--size-control) / 2);
  border-radius: var(--radius-full);
  background: var(--color-brand-primary);
}
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 6: 통과 + 타입체크** — PASS + exit 0.

- [ ] **Step 7: 커밋**
```bash
git add packages/react/src/Radio
git commit -m "feat(react): Radio/RadioGroup forwardRef + control tokens + focus-ring"
```

---

## Task 6: Spinner — forwardRef + 영문 aria-label + semantic 트랙색

**Files:** Rewrite `packages/react/src/Spinner/Spinner.tsx`, `packages/react/src/Spinner/Spinner.module.css`. Test 기존.

- [ ] **Step 1: ref 테스트 추가** (`createRef` import 후)
```tsx
  it("forwards ref to the spinner element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
```

- [ ] **Step 2: 실패 확인** — Run `pnpm --filter @superbase/react test src/Spinner/Spinner.test.tsx`.

- [ ] **Step 3: Spinner.tsx 전체 교체** (기본 aria-label 한국어→영문)
```tsx
import { forwardRef, type CSSProperties } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", color, className, "aria-label": ariaLabel = "Loading", ...rest },
  ref,
) {
  const style = color ? ({ "--spinner-color": color } as CSSProperties) : undefined;
  return (
    <span
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      style={style}
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
});
```

- [ ] **Step 4: Spinner.module.css 전체 교체** (트랙색만 semantic으로; 크기/회전은 컴포넌트 고유값 유지)
```css
.spinner {
  display: inline-block;
  border-radius: var(--radius-full);
  border-style: solid;
  border-color: var(--color-border-default);
  border-top-color: var(--spinner-color, var(--color-brand-primary));
  animation: superbase-spin 0.6s linear infinite;
}
.spinner[data-size="sm"] { width: 16px; height: 16px; border-width: 2px; }
.spinner[data-size="md"] { width: 24px; height: 24px; border-width: 3px; }
.spinner[data-size="lg"] { width: 36px; height: 36px; border-width: 4px; }
@keyframes superbase-spin { to { transform: rotate(360deg); } }
```
> 회전 `0.6s`·크기(16/24/36)·border-width(2/3/4)는 ActivityIndicator/스피너 고유 드로잉 값이라 토큰화하지 않음(의도). 트랙색 `--color-gray-200`→`--color-border-default`(semantic, 다크 대응).

- [ ] **Step 5: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react test src/Spinner/Spinner.test.tsx` → PASS.
> 만약 기존 테스트가 기본 aria-label `"로딩 중"`을 단언하면 `"Loading"`으로 업데이트(의도된 변경). 변경 시 보고.
Run: `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/Spinner
git commit -m "feat(react): Spinner forwardRef + English a11y default + semantic track color"
```

---

## Task 7: Text · Badge · Stack · Icon — forwardRef (CSS 변경 없음)

**Files:** Rewrite `packages/react/src/Text/Text.tsx`, `packages/react/src/Badge/Badge.tsx`, `packages/react/src/Stack/Stack.tsx`, `packages/react/src/Icon/Icon.tsx`. 각 테스트 파일에 ref 케이스 추가.

이 4개는 CSS에 하드코딩이 없어 `forwardRef`만 추가.

- [ ] **Step 1: Text.tsx 전체 교체** (polymorphic `as` → ref는 HTMLElement)
```tsx
import { forwardRef, type ElementType, type ReactNode } from "react";
import styles from "./Text.module.css";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  as?: ElementType;
  className?: string;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { children, variant = "body", weight = "regular", color = "primary", as: Tag = "span", className },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-variant={variant}
      data-weight={weight}
      data-color={color}
      className={[styles.text, className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
});
```
> `<Tag ref={ref}>`에서 typecheck 에러가 나면 `ref={ref as React.Ref<never>}`로 캐스트(폴리모픽 ElementType 한계). ref 전달 + typecheck 통과가 기준.

- [ ] **Step 2: Badge.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, variant = "neutral", className },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
});
```

- [ ] **Step 3: Stack.tsx 전체 교체**
```tsx
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import styles from "./Stack.module.css";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps {
  children: ReactNode;
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  className?: string;
}

const spacingValue = (n: SpacingScale): string => (n === 0 ? "0" : `var(--spacing-${n})`);

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { children, direction = "column", gap = 0, padding = 0, align, justify, className },
  ref,
) {
  const style: CSSProperties = {
    display: "flex",
    flexDirection: direction,
    gap: spacingValue(gap),
    padding: spacingValue(padding),
    alignItems: align,
    justifyContent: justify,
  };
  return (
    <div
      ref={ref}
      data-direction={direction}
      className={[styles.stack, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});
```

- [ ] **Step 4: Icon.tsx 전체 교체**
```tsx
import { forwardRef, type SVGProps } from "react";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "color"> {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 20, color = "currentColor", label, ...rest },
  ref,
) {
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
});
```

- [ ] **Step 5: 각 테스트에 ref 케이스 추가**

각 파일에 `createRef` import 추가 후 describe 끝 직전:
- `packages/react/src/Text/Text.test.tsx`:
```tsx
  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Text ref={ref}>x</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
```
- `packages/react/src/Badge/Badge.test.tsx`:
```tsx
  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
```
- `packages/react/src/Stack/Stack.test.tsx`:
```tsx
  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>x</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
```
- `packages/react/src/Icon/Icon.test.tsx`:
```tsx
  it("forwards ref", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon ref={ref} name="check" />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });
```
> 각 테스트 파일에 해당 컴포넌트 import가 이미 있다고 가정. `createRef`만 추가.

- [ ] **Step 6: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react test src/Text src/Badge src/Stack src/Icon` → PASS.
Run: `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 7: 커밋**
```bash
git add packages/react/src/Text packages/react/src/Badge packages/react/src/Stack packages/react/src/Icon
git commit -m "feat(react): Text/Badge/Stack/Icon forwardRef"
```

---

## Task 8: docs Foundations — 효과 토큰(shadow/motion/opacity/border) 시각화

**Files:** Modify `apps/docs/lib/tokens.ts`, `apps/docs/app/foundations/page.tsx`.

- [ ] **Step 1: lib/tokens.ts에 효과 토큰 배열 추가**

`apps/docs/lib/tokens.ts` 맨 끝에 추가:
```ts
export const shadows: DisplayToken[] = [
  { name: "sm", cssVar: "--shadow-sm" },
  { name: "md", cssVar: "--shadow-md" },
  { name: "lg", cssVar: "--shadow-lg" },
  { name: "xl", cssVar: "--shadow-xl" },
];

export const effectTokens: DisplayToken[] = [
  { name: "duration.fast", cssVar: "--duration-fast" },
  { name: "duration.base", cssVar: "--duration-base" },
  { name: "duration.slow", cssVar: "--duration-slow" },
  { name: "easing.standard", cssVar: "--easing-standard" },
  { name: "opacity.disabled", cssVar: "--opacity-disabled" },
  { name: "opacity.pressed", cssVar: "--opacity-pressed" },
  { name: "border-width.thin", cssVar: "--border-width-thin" },
  { name: "border-width.medium", cssVar: "--border-width-medium" },
  { name: "line-height.body", cssVar: "--line-height-body" },
];
```

- [ ] **Step 2: foundations/page.tsx에 효과 탭 추가**

`apps/docs/app/foundations/page.tsx`:
1. import 라인에 `shadows, effectTokens` 추가:
```ts
import { semanticColors, spacingScale, fontSizes, radii, shadows, effectTokens, type ColorGroup } from "../../lib/tokens";
```
2. `radiusPanel` 정의 **뒤**, `export default function` **앞**에 `effectsPanel` 추가:
```tsx
const effectsPanel = (
  <div>
    <p style={sub}>그림자·모션·불투명도·보더 등 효과 토큰.</p>
    <div style={groupLabel}>Elevation</div>
    <div style={{ display: "flex", gap: "var(--spacing-6)", flexWrap: "wrap", marginBottom: "var(--spacing-4)" }}>
      {shadows.map((s) => (
        <div key={s.cssVar} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-2)" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "var(--radius-md)",
              background: "var(--color-background-default)",
              boxShadow: `var(${s.cssVar})`,
            }}
          />
          <span style={labelMono}>shadow-{s.name}</span>
        </div>
      ))}
    </div>
    <div style={groupLabel}>Motion · Opacity · Border · Line-height</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      {effectTokens.map((tk) => (
        <div
          key={tk.cssVar}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-4)",
            padding: "var(--spacing-2) 0",
            borderBottom: "1px solid var(--color-background-subtle)",
          }}
        >
          <span style={{ flex: 1, fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {tk.name}
          </span>
          <span style={labelMono}>
            <TokenValue cssVar={tk.cssVar} />
          </span>
        </div>
      ))}
    </div>
  </div>
);
```
3. `<Tabs ... items={[...]}>` 배열 끝에 효과 탭 추가:
```tsx
          { id: "radius", label: "Radius", content: radiusPanel },
          { id: "effects", label: "Effects", content: effectsPanel },
```

- [ ] **Step 3: 빌드 + 타입체크**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(`/foundations` 빌드).

- [ ] **Step 4: 커밋**
```bash
git add apps/docs/lib/tokens.ts apps/docs/app/foundations/page.tsx
git commit -m "feat(docs): Foundations effects tab (shadow/motion/opacity/border tokens)"
```

---

## Task 9: 전체 검증 + changeset

**Files:** Create `.changeset/phase1c-web-hardening.md`.

- [ ] **Step 1: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과. `@superbase/react` 빌드(Vite) 성공 — 모든 컴포넌트 forwardRef로 export. 기존 react 테스트 전부 통과 + 신규 ref 케이스.

- [ ] **Step 2: changeset 작성**

Create `.changeset/phase1c-web-hardening.md`:
```md
---
"@superbase/react": minor
---

웹 컴포넌트 하드닝: 10개 컴포넌트에 forwardRef 추가(ref 전달). CSS의 하드코딩 치수·트랜지션·opacity를 토큰(size/border-width/opacity/motion)으로 교체하고, 인터랙티브 컴포넌트(Button/TextField/Switch/Checkbox/Radio)에 :focus-visible focus-ring을 일관 적용. TextField error 색을 semantic(status-danger)으로, Spinner 기본 aria-label을 영문("Loading")으로, Switch/Spinner 트랙 색을 semantic(border-default)으로 변경.
```

- [ ] **Step 3: 커밋**
```bash
git add .changeset/phase1c-web-hardening.md
git commit -m "chore(react): changeset for web hardening"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 기존 react 테스트 + 신규 ref 케이스 통과.
- 10개 웹 컴포넌트가 `forwardRef`로 ref 전달. Button/TextField/Switch/Checkbox/Radio CSS의 하드코딩 치수/트랜지션/opacity가 1a 토큰으로 교체되고 `:focus-visible` focus-ring 적용.
- TextField/Spinner 색이 semantic 토큰, Spinner 기본 aria-label "Loading".
- docs Foundations에 Effects 탭(shadow 박스 + 모션/opacity/border/line-height 값) 추가, `/foundations` 빌드 성공.
- changeset로 `@superbase/react` minor 예약.

## 이후 (Phase 1 완료 후)
- Phase 1(파운데이션 하드닝) 3개 플랜(1a·1b·1c) 모두 완료 → 버전 PR 머지 시 tokens·react·react-native 일괄 배포.
- **Phase 2**(기존 컴포넌트 심화: Button loading/아이콘 슬롯, TextField size/slot/helper, Checkbox indeterminate, Badge size/icon, elevation 활용 등) 별도 brainstorming→spec→plan.
- docs에 RN `ThemeProvider` 사용법 + 다크 토글 데모는 Phase 2 또는 별도 마무리.
