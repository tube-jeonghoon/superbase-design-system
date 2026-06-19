# Plan 5 — status 토큰 + 웹 컴포넌트 4종 (v0.2) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/tokens`에 status 색(info/success/warning/danger)을 추가하고, `@superbase/react`에 Checkbox·RadioGroup+Radio·Badge·Spinner 4종을 추가한 뒤 문서 사이트에 쇼케이스하고 changeset으로 0.2.0(minor)을 예약한다.

**Architecture:** 기존 패턴 그대로 — 컴포넌트는 `src/<Name>/<Name>.tsx` + `.module.css`로 분리, 변형은 `data-*` 속성 + CSS 속성 선택자, 스타일은 토큰 CSS 변수 참조, 테스트는 role/접근성/동작 검증(Vitest + RTL). Radio는 React Context로 그룹 상태를 공유. 토큰은 Style Dictionary가 웹 CSS + RN native에 status 변수를 함께 방출.

**Tech Stack:** React 19, TypeScript 5, Vite 5(라이브러리), Vitest 2 + jsdom + Testing Library, Style Dictionary 4, Changesets.

> 전제: v1 4개 패키지가 `main`에 있음. `@superbase/react`는 Text/Button/TextField/Stack/Switch를 export. 토큰 빌드는 `outputReferences` 없이 hex로 출력(semantic→primitive 해석). Node 22, pnpm 10.27.0. 작업 루트 `/Users/jeonjeonghoon/Documents/Personal/Projects/design-library`.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/tokens/src/primitives.json` (수정) | green.500 / yellow.500 추가 |
| `packages/tokens/src/semantic.light.json` (수정) | color.status.{info,success,warning,danger} |
| `packages/tokens/src/semantic.dark.json` (수정) | 동일 status (동일 primitive) |
| `packages/tokens/test/build.test.ts` (수정) | status 변수 검증 + 스냅샷 |
| `packages/react/src/Checkbox/*` | Checkbox |
| `packages/react/src/Radio/*` | RadioContext + RadioGroup + Radio |
| `packages/react/src/Badge/*` | Badge |
| `packages/react/src/Spinner/*` | Spinner |
| `packages/react/src/index.ts` (수정) | export 추가 |
| `apps/docs/lib/tokens.ts` (수정) | Foundations에 status 색 추가 |
| `apps/docs/lib/tokens.test.ts` (수정) | semanticColors 길이 12 |
| `apps/docs/app/components/page.tsx` (수정) | 4종 쇼케이스 섹션 |
| `.changeset/web-components-v0-2.md` | minor 버전 예약 |

---

## Task 1: status 색 토큰 추가 (TDD)

**Files:** Modify `packages/tokens/src/primitives.json`, `src/semantic.light.json`, `src/semantic.dark.json`, `test/build.test.ts`

- [ ] **Step 1: 실패 테스트 추가 — `test/build.test.ts`의 `describe("token build outputs")` 안에 추가**

```ts
  it("emits status semantic colors (web + native)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--color-status-success: #00b26d;");
    expect(css).toContain("--color-status-warning: #ffb020;");
    expect(css).toContain("--color-status-danger: #f04452;");
    const ts = readFileSync(join(pkgRoot, "dist/native/tokens.js"), "utf8");
    expect(ts).toContain('export const ColorStatusSuccess = "#00b26d";');
  });
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/tokens test` → FAIL (status 토큰 없음).

- [ ] **Step 3: primitive 추가 — `src/primitives.json`의 `color` 객체에 `red` 다음(또는 임의 위치)에 green/yellow 추가**

`"red": { "500": { "value": "#f04452" } }` 항목 뒤에 쉼표로 이어서 추가:
```json
    "green": { "500": { "value": "#00b26d" } },
    "yellow": { "500": { "value": "#ffb020" } }
```
(즉 `color` 객체가 blue, gray, white, black, red, green, yellow를 포함하게 된다.)

- [ ] **Step 4: semantic status 추가 — `src/semantic.light.json`의 `color` 객체에 `border` 다음에 추가**

`"border": { "default": { "value": "{color.gray.200}" } }` 뒤에 쉼표로 이어서:
```json
    "status": {
      "info":    { "value": "{color.blue.500}" },
      "success": { "value": "{color.green.500}" },
      "warning": { "value": "{color.yellow.500}" },
      "danger":  { "value": "{color.red.500}" }
    }
```

- [ ] **Step 5: dark에도 동일 status 추가 — `src/semantic.dark.json`의 `color` 객체에 `border` 다음에 동일하게 추가**

`"border": { "default": { "value": "{color.gray.800}" } }` 뒤에 쉼표로 이어서:
```json
    "status": {
      "info":    { "value": "{color.blue.500}" },
      "success": { "value": "{color.green.500}" },
      "warning": { "value": "{color.yellow.500}" },
      "danger":  { "value": "{color.red.500}" }
    }
```

- [ ] **Step 6: 빌드 + 스냅샷 갱신 + 통과 확인**

Run: `pnpm --filter @superbase/tokens build`
실제 출력 확인:
```bash
grep "color-status" packages/tokens/dist/web/variables.css | head
grep "ColorStatus" packages/tokens/dist/native/tokens.js
```
기대: `--color-status-success: #00b26d;` 등(light/dark 양쪽), native `ColorStatusSuccess = "#00b26d"` 등.

스냅샷 갱신: `pnpm --filter @superbase/tokens test -u` 후 `pnpm --filter @superbase/tokens test` → 전부 PASS.

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/tokens typecheck` → exit 0.
```bash
git add packages/tokens/src packages/tokens/test
git commit -m "feat(tokens): add status semantic colors (info/success/warning/danger)"
```

---

## Task 2: Checkbox (웹, TDD)

**Files:** Create `packages/react/src/Checkbox/Checkbox.tsx`, `Checkbox.module.css`, `Checkbox.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Checkbox/Checkbox.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("exposes checkbox role with checked state", () => {
    render(<Checkbox checked aria-label="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
  });

  it("uses label as the accessible name", () => {
    render(<Checkbox checked={false} label="동의" />);
    expect(screen.getByRole("checkbox", { name: "동의" })).toBeInTheDocument();
  });

  it("calls onChange with the toggled value", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="x" />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled aria-label="x" />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL.

- [ ] **Step 3: `src/Checkbox/Checkbox.module.css`**

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
.checkbox:disabled { cursor: not-allowed; opacity: 0.4; }
.box {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border-default);
  background: var(--color-background-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.checkbox[data-checked="true"] .box {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}
.check { width: 10px; height: 10px; border-radius: 1px; background: transparent; }
.checkbox[data-checked="true"] .check { background: var(--color-white); }
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 4: `src/Checkbox/Checkbox.tsx`**

```tsx
import type { ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <button
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
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts` 끝에 추가**

```ts
export { Checkbox } from "./Checkbox/Checkbox";
export type { CheckboxProps } from "./Checkbox/Checkbox";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → exit 0.
```bash
git add packages/react/src/Checkbox packages/react/src/index.ts
git commit -m "feat(react): add Checkbox component"
```

---

## Task 3: RadioGroup + Radio (웹, TDD)

**Files:** Create `packages/react/src/Radio/RadioContext.ts`, `RadioGroup.tsx`, `Radio.tsx`, `Radio.module.css`, `Radio.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Radio/Radio.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "./Radio";

describe("RadioGroup + Radio", () => {
  it("reflects the group value as checked state", () => {
    render(
      <RadioGroup value="b" aria-label="opt">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it("calls the group onChange with the selected value", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange} aria-label="opt">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL.

- [ ] **Step 3: `src/Radio/RadioContext.ts`**

```ts
import { createContext, useContext } from "react";

export interface RadioContextValue {
  value: string;
  onChange?: (value: string) => void;
}

export const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadioContext(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("Radio must be used within a RadioGroup");
  return ctx;
}
```

- [ ] **Step 4: `src/Radio/Radio.module.css`**

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
.radio:disabled { cursor: not-allowed; opacity: 0.4; }
.dot {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-default);
  background: var(--color-background-default);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
}
.radio[data-checked="true"] .dot { border-color: var(--color-brand-primary); }
.radio[data-checked="true"] .dot::after {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-brand-primary);
}
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 5: `src/Radio/RadioGroup.tsx`**

```tsx
import type { ReactNode } from "react";
import { RadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioGroupProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function RadioGroup({
  value,
  onChange,
  children,
  className,
  ...rest
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <RadioContext.Provider value={{ value, onChange }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
}
```

- [ ] **Step 6: `src/Radio/Radio.tsx`**

```tsx
import type { ReactNode } from "react";
import { useRadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Radio({ value, label, disabled = false, className }: RadioProps) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <button
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
}
```

- [ ] **Step 7: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 8: `src/index.ts` 끝에 추가**

```ts
export { RadioGroup } from "./Radio/RadioGroup";
export type { RadioGroupProps } from "./Radio/RadioGroup";
export { Radio } from "./Radio/Radio";
export type { RadioProps } from "./Radio/Radio";
```

- [ ] **Step 9: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → exit 0.
```bash
git add packages/react/src/Radio packages/react/src/index.ts
git commit -m "feat(react): add RadioGroup and Radio components"
```

---

## Task 4: Badge (웹, TDD)

**Files:** Create `packages/react/src/Badge/Badge.tsx`, `Badge.module.css`, `Badge.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Badge/Badge.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("defaults to neutral and reflects variant via data attribute", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveAttribute("data-variant", "success");
  });

  it("defaults variant to neutral", () => {
    render(<Badge>n</Badge>);
    expect(screen.getByText("n")).toHaveAttribute("data-variant", "neutral");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL.

- [ ] **Step 3: `src/Badge/Badge.module.css`**

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}
.badge[data-variant="neutral"] { background: var(--color-background-subtle); color: var(--color-text-secondary); }
.badge[data-variant="brand"] { background: var(--color-brand-primary); color: var(--color-white); }
.badge[data-variant="success"] { background: var(--color-status-success); color: var(--color-white); }
.badge[data-variant="warning"] { background: var(--color-status-warning); color: var(--color-white); }
.badge[data-variant="danger"] { background: var(--color-status-danger); color: var(--color-white); }
```

- [ ] **Step 4: `src/Badge/Badge.tsx`**

```tsx
import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      data-variant={variant}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts` 끝에 추가**

```ts
export { Badge } from "./Badge/Badge";
export type { BadgeProps, BadgeVariant } from "./Badge/Badge";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → exit 0.
```bash
git add packages/react/src/Badge packages/react/src/index.ts
git commit -m "feat(react): add Badge component"
```

---

## Task 5: Spinner (웹, TDD)

**Files:** Create `packages/react/src/Spinner/Spinner.tsx`, `Spinner.module.css`, `Spinner.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Spinner/Spinner.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes a status role with an accessible label", () => {
    render(<Spinner aria-label="불러오는 중" />);
    expect(screen.getByRole("status", { name: "불러오는 중" })).toBeInTheDocument();
  });

  it("defaults size to md (data attribute)", () => {
    render(<Spinner aria-label="x" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "md");
  });

  it("reflects the size prop", () => {
    render(<Spinner size="lg" aria-label="x" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "lg");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL.

- [ ] **Step 3: `src/Spinner/Spinner.module.css`**

```css
.spinner {
  display: inline-block;
  border-radius: var(--radius-full);
  border-style: solid;
  border-color: var(--color-gray-200);
  border-top-color: var(--spinner-color, var(--color-brand-primary));
  animation: superbase-spin 0.6s linear infinite;
}
.spinner[data-size="sm"] { width: 16px; height: 16px; border-width: 2px; }
.spinner[data-size="md"] { width: 24px; height: 24px; border-width: 3px; }
.spinner[data-size="lg"] { width: 36px; height: 36px; border-width: 4px; }
@keyframes superbase-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 4: `src/Spinner/Spinner.tsx`**

```tsx
import type { CSSProperties } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

export function Spinner({
  size = "md",
  color,
  className,
  "aria-label": ariaLabel = "로딩 중",
  ...rest
}: SpinnerProps) {
  const style = color
    ? ({ "--spinner-color": color } as CSSProperties)
    : undefined;
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      style={style}
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts` 끝에 추가**

```ts
export { Spinner } from "./Spinner/Spinner";
export type { SpinnerProps, SpinnerSize } from "./Spinner/Spinner";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → exit 0.
```bash
git add packages/react/src/Spinner packages/react/src/index.ts
git commit -m "feat(react): add Spinner component"
```

---

## Task 6: 문서 쇼케이스 + Foundations status 색 + changeset + 전체 검증

**Files:** Modify `apps/docs/lib/tokens.ts`, `apps/docs/lib/tokens.test.ts`, `apps/docs/app/components/page.tsx`; Create `.changeset/web-components-v0-2.md`

- [ ] **Step 1: Foundations 테스트 길이 갱신 — `apps/docs/lib/tokens.test.ts`**

`expect(semanticColors).toHaveLength(8);` 를 `expect(semanticColors).toHaveLength(12);` 로 바꾼다.

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (아직 8개).

- [ ] **Step 3: `apps/docs/lib/tokens.ts`의 `semanticColors` 배열에 status 4개 추가**

`{ name: "border.default", cssVar: "--color-border-default" },` 다음(배열 닫기 `]` 전)에 추가:
```ts
  { name: "status.info", cssVar: "--color-status-info" },
  { name: "status.success", cssVar: "--color-status-success" },
  { name: "status.warning", cssVar: "--color-status-warning" },
  { name: "status.danger", cssVar: "--color-status-danger" },
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS (semanticColors 12개).

- [ ] **Step 5: Components 페이지에 4종 쇼케이스 추가 — `apps/docs/app/components/page.tsx`**

상단 import 줄을 아래로 교체(기존 컴포넌트 + 신규 추가):
```tsx
import { useState } from "react";
import {
  Text,
  Button,
  TextField,
  Stack,
  Switch,
  Checkbox,
  RadioGroup,
  Radio,
  Badge,
  Spinner,
} from "@superbase/react";
```

그리고 `export default function ComponentsPage()` 안의 state 선언부에 두 줄 추가(기존 `const [name...]`, `const [on...]` 아래):
```tsx
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState("basic");
```

마지막 `</Stack>` 직전(Switch 섹션 다음)에 아래 4개 섹션을 추가:
```tsx
      <section>
        <Text as="h2" variant="title" weight="bold">
          Checkbox
        </Text>
        <Stack direction="column" gap={2}>
          <Checkbox checked={agree} onChange={setAgree} label="약관에 동의합니다" />
          <Checkbox checked disabled label="비활성(선택됨)" />
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Radio
        </Text>
        <RadioGroup value={plan} onChange={setPlan} aria-label="요금제">
          <Radio value="basic" label="Basic" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Enterprise" disabled />
        </RadioGroup>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Badge
        </Text>
        <Stack direction="row" gap={2} align="center">
          <Badge>Neutral</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Spinner
        </Text>
        <Stack direction="row" gap={4} align="center">
          <Spinner size="sm" aria-label="로딩 sm" />
          <Spinner size="md" aria-label="로딩 md" />
          <Spinner size="lg" aria-label="로딩 lg" />
        </Stack>
      </section>
```

- [ ] **Step 6: changeset 작성 — `.changeset/web-components-v0-2.md`**

```markdown
---
"@superbase/tokens": minor
"@superbase/react": minor
---

토큰에 status 색(info/success/warning/danger)을 추가하고, 웹 컴포넌트 Checkbox, RadioGroup+Radio, Badge, Spinner를 추가한다.
```

- [ ] **Step 7: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: tokens·react·docs·react-native 전부 통과. react 테스트가 신규 컴포넌트만큼 증가(기존 17 + Checkbox 4 + Radio 2 + Badge 3 + Spinner 3 = 29), docs `next build`에 `/components` 라우트 정상(신규 컴포넌트 렌더). 실제 수치는 보고.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/lib apps/docs/app/components .changeset/web-components-v0-2.md
git commit -m "feat(docs): showcase v0.2 web components + add status colors; changeset"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 4개 워크스페이스 전부 통과한다.
- `@superbase/react`가 Checkbox, RadioGroup, Radio, Badge, Spinner를 추가로 export한다.
- `@superbase/tokens`가 `--color-status-{info,success,warning,danger}`(웹) + `ColorStatus*`(native)를 방출한다.
- 문서 Components 페이지에 4종이 라이브 렌더되고 Foundations에 status 색이 보인다.
- `.changeset/web-components-v0-2.md`가 tokens·react를 minor로 예약한다(머지 시 Release 액션이 0.2.0 배포).

## 다음 플랜

- **Plan 6**: `@superbase/react-native`에 동일 4종(Checkbox/Radio/Badge/Spinner) 추가 — native status 토큰 + `ActivityIndicator` 등 소비. changeset(react-native minor).
