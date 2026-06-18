# Plan 2 — `@superbase/react` 웹 컴포넌트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 디자인 토큰(CSS 변수)을 소비하는 웹 컴포넌트 5종(Text, Button, TextField, Stack, Switch)을 담은 `@superbase/react` 패키지를, Vite 라이브러리 빌드 + Vitest/Testing Library 테스트와 함께 만든다.

**Architecture:** 각 컴포넌트는 `src/<Name>/<Name>.tsx` + `<Name>.module.css`로 분리한다. 스타일은 CSS Modules가 토큰 CSS 변수(`var(--color-brand-primary)` 등)를 참조한다. 변형(variant/size 등)은 `data-*` 속성으로 노출하고 CSS는 속성 선택자로 스타일링하며, 테스트는 클래스 해시가 아닌 **역할(role)·접근성·동작·data 속성**으로 검증한다. Vite library mode가 `dist/index.js` + `dist/index.d.ts` + `dist/style.css`를 생성한다.

**Tech Stack:** React 19, TypeScript 5, Vite 6 (library mode + vite-plugin-dts), Vitest 2 + jsdom + @testing-library/react + jest-dom, CSS Modules. 토큰 CSS 변수는 `@superbase/tokens`가 제공(소비자가 `@superbase/tokens/css`를 로드한다고 가정 — 이 패키지는 변수 이름만 참조).

> 전제: Plan 1이 `main`에 머지되어 모노레포(pnpm + turbo)와 `@superbase/tokens`가 존재한다. 작업 디렉토리 루트는 `/Users/jeonjeonghoon/Documents/Personal/Projects/design-library`. Node 22, pnpm 10.27.0. 루트 `turbo.json`에는 이미 `build`/`test`/`typecheck` 태스크가 있다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/react/package.json` | 패키지 메타, exports, peer deps(react), 스크립트(build/test/typecheck) |
| `packages/react/tsconfig.json` | TS 설정(jsx, dom lib, 테스트 타입) |
| `packages/react/vite.config.ts` | 라이브러리 빌드 + Vitest 설정(통합) |
| `packages/react/src/css-modules.d.ts` | `*.module.css` 모듈 타입 선언 |
| `packages/react/src/test-setup.ts` | jest-dom 매처 등록 |
| `packages/react/src/smoke.test.tsx` | 테스트 하니스 동작 확인용 스모크 테스트 |
| `packages/react/src/index.ts` | 배럴 export (모든 컴포넌트/타입) |
| `packages/react/src/Text/Text.tsx` `+ Text.module.css` `+ Text.test.tsx` | 타이포그래피 |
| `packages/react/src/Button/Button.tsx` `+ .module.css` `+ .test.tsx` | 버튼 |
| `packages/react/src/TextField/TextField.tsx` `+ .module.css` `+ .test.tsx` | 텍스트 입력 |
| `packages/react/src/Stack/Stack.tsx` `+ .module.css` `+ .test.tsx` | 레이아웃 프리미티브 |
| `packages/react/src/Switch/Switch.tsx` `+ .module.css` `+ .test.tsx` | 토글 |
| `packages/react/README.md` | 사용법 |

---

## Task 1: `@superbase/react` 패키지 스캐폴드 + 테스트 하니스

**Files:**
- Create: `packages/react/package.json`, `packages/react/tsconfig.json`, `packages/react/vite.config.ts`, `packages/react/src/css-modules.d.ts`, `packages/react/src/test-setup.ts`, `packages/react/src/index.ts`, `packages/react/src/smoke.test.tsx`

- [ ] **Step 1: `packages/react/package.json` 작성**

```json
{
  "name": "@superbase/react",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/style.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.3.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: `packages/react/tsconfig.json` 작성**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: `packages/react/vite.config.ts` 작성**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], exclude: ["**/*.test.*", "src/test-setup.ts"] }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
      cssFileName: "style",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});
```

- [ ] **Step 4: `packages/react/src/css-modules.d.ts` 작성**

```ts
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

- [ ] **Step 5: `packages/react/src/test-setup.ts` 작성**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: `packages/react/src/index.ts` 작성 (빈 배럴, 컴포넌트는 이후 태스크에서 추가)**

```ts
export {};
```

- [ ] **Step 7: 스모크 테스트 작성 — `packages/react/src/smoke.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";

describe("test harness", () => {
  it("renders and matches with jest-dom", () => {
    render(<div>harness-ok</div>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: 설치 후 스모크 테스트 실행**

Run: `pnpm install`
Expected: `@superbase/react` 의존성 설치 완료. 해석된 주요 버전(react, vite, vitest, @testing-library/react)을 보고에 기록.

Run: `pnpm --filter @superbase/react test`
Expected: PASS — 1 test passed. (esbuild 빌드 스크립트가 pnpm 10에서 차단되어 vitest가 실패하면, 루트 `package.json`에 `"pnpm": { "onlyBuiltDependencies": ["esbuild"] }`를 추가하고 `pnpm install` 재실행한 뒤 다시 시도. 이 경우 변경을 이 태스크 커밋에 포함.)

> 검증 포인트: Vitest가 jsdom 환경에서 RTL `render`와 jest-dom 매처(`toBeInTheDocument`)를 정상 동작시키는지 확인한다. 실패하면 setupFiles 경로/타입 설정을 점검하고 보고하라.

- [ ] **Step 9: typecheck 확인**

Run: `pnpm --filter @superbase/react typecheck`
Expected: PASS (exit 0). CSS module/타입 선언이 올바르면 에러 없음.

- [ ] **Step 10: Commit**

```bash
git add packages/react/package.json packages/react/tsconfig.json packages/react/vite.config.ts packages/react/src/css-modules.d.ts packages/react/src/test-setup.ts packages/react/src/index.ts packages/react/src/smoke.test.tsx pnpm-lock.yaml
# (esbuild 수정을 했다면 루트 package.json도 add)
git commit -m "feat(react): scaffold react package with vitest+RTL harness"
```

---

## Task 2: Text 컴포넌트 (TDD)

**Files:**
- Create: `packages/react/src/Text/Text.tsx`, `packages/react/src/Text/Text.module.css`, `packages/react/src/Text/Text.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성 — `src/Text/Text.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  it("renders its children", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("reflects variant, weight, and color via data attributes", () => {
    render(
      <Text variant="title" weight="bold" color="brand">
        Hi
      </Text>,
    );
    const el = screen.getByText("Hi");
    expect(el).toHaveAttribute("data-variant", "title");
    expect(el).toHaveAttribute("data-weight", "bold");
    expect(el).toHaveAttribute("data-color", "brand");
  });

  it("defaults to span with body/regular/primary", () => {
    render(<Text>Plain</Text>);
    const el = screen.getByText("Plain");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-variant", "body");
    expect(el).toHaveAttribute("data-weight", "regular");
    expect(el).toHaveAttribute("data-color", "primary");
  });

  it("renders a custom element via the `as` prop", () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test`
Expected: FAIL — `./Text` 모듈 없음.

- [ ] **Step 3: `src/Text/Text.module.css` 작성**

```css
.text {
  margin: 0;
  font-family: inherit;
  color: var(--color-text-primary);
}
.text[data-color="secondary"] { color: var(--color-text-secondary); }
.text[data-color="disabled"] { color: var(--color-text-disabled); }
.text[data-color="brand"] { color: var(--color-brand-primary); }
.text[data-variant="caption"] { font-size: var(--font-size-caption); }
.text[data-variant="body"] { font-size: var(--font-size-body); }
.text[data-variant="title"] { font-size: var(--font-size-title); }
.text[data-variant="display"] { font-size: var(--font-size-display); }
.text[data-weight="regular"] { font-weight: var(--font-weight-regular); }
.text[data-weight="medium"] { font-weight: var(--font-weight-medium); }
.text[data-weight="bold"] { font-weight: var(--font-weight-bold); }
```

- [ ] **Step 4: `src/Text/Text.tsx` 작성**

```tsx
import type { ElementType, ReactNode } from "react";
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

export function Text({
  children,
  variant = "body",
  weight = "regular",
  color = "primary",
  as: Tag = "span",
  className,
}: TextProps) {
  return (
    <Tag
      data-variant={variant}
      data-weight={weight}
      data-color={color}
      className={[styles.text, className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/react test`
Expected: PASS — Text 테스트 4개 + 스모크 1개 통과.

- [ ] **Step 6: `src/index.ts`에 export 추가**

`src/index.ts` 전체를 아래로 교체:

```ts
export { Text } from "./Text/Text";
export type { TextProps, TextVariant, TextWeight, TextColor } from "./Text/Text";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → PASS.
```bash
git add packages/react/src/Text packages/react/src/index.ts
git commit -m "feat(react): add Text component"
```

---

## Task 3: Button 컴포넌트 (TDD)

**Files:**
- Create: `packages/react/src/Button/Button.tsx`, `Button.module.css`, `Button.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성 — `src/Button/Button.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders label, defaults to type=button / primary / md", () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL (`./Button` 없음).

- [ ] **Step 3: `src/Button/Button.module.css` 작성**

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
  transition: background-color 0.15s ease;
}
.button:disabled { cursor: not-allowed; opacity: 0.4; }
.button[data-size="sm"] { height: 36px; padding: 0 var(--spacing-3); font-size: var(--font-size-caption); }
.button[data-size="md"] { height: 44px; padding: 0 var(--spacing-4); font-size: var(--font-size-body); }
.button[data-size="lg"] { height: 52px; padding: 0 var(--spacing-6); font-size: var(--font-size-title); }
.button[data-variant="primary"] { background: var(--color-brand-primary); color: var(--color-white); }
.button[data-variant="primary"]:hover:not(:disabled) { background: var(--color-brand-pressed); }
.button[data-variant="secondary"] { background: var(--color-background-subtle); color: var(--color-text-primary); }
```

- [ ] **Step 4: `src/Button/Button.tsx` 작성**

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts`에 export 추가**

`src/index.ts` 끝에 아래 두 줄 추가:

```ts
export { Button } from "./Button/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button/Button";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → PASS.
```bash
git add packages/react/src/Button packages/react/src/index.ts
git commit -m "feat(react): add Button component"
```

---

## Task 4: TextField 컴포넌트 (TDD)

**Files:**
- Create: `packages/react/src/TextField/TextField.tsx`, `TextField.module.css`, `TextField.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성 — `src/TextField/TextField.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("calls onChange with the new string value", async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Name"), "ab");
    expect(onChange).toHaveBeenLastCalledWith("ab");
  });

  it("shows an error message and marks the input invalid", () => {
    render(<TextField label="Email" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL (`./TextField` 없음).

- [ ] **Step 3: `src/TextField/TextField.module.css` 작성**

```css
.field { display: flex; flex-direction: column; gap: var(--spacing-1); }
.label { font-size: var(--font-size-caption); color: var(--color-text-secondary); }
.input {
  height: 48px;
  padding: 0 var(--spacing-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  background: var(--color-background-default);
}
.input:focus { outline: none; border-color: var(--color-brand-primary); }
.input[data-error="true"] { border-color: var(--color-red-500); }
.error { font-size: var(--font-size-caption); color: var(--color-red-500); }
```

- [ ] **Step 4: `src/TextField/TextField.tsx` 작성**

```tsx
import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function TextField({
  label,
  error,
  id,
  value,
  onChange,
  className,
  ...rest
}: TextFieldProps) {
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
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

> 참고: 위 테스트는 `value`를 넘기지 않아 input이 비제어로 동작하므로 `userEvent.type`이 글자별로 onChange를 호출하고 마지막 호출값이 `"ab"`가 된다. React가 "uncontrolled→controlled" 경고를 내지 않도록 `value`는 전달하지 않는다.

- [ ] **Step 6: `src/index.ts`에 export 추가**

`src/index.ts` 끝에 아래 두 줄 추가:

```ts
export { TextField } from "./TextField/TextField";
export type { TextFieldProps } from "./TextField/TextField";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → PASS.
```bash
git add packages/react/src/TextField packages/react/src/index.ts
git commit -m "feat(react): add TextField component"
```

---

## Task 5: Stack 컴포넌트 (TDD)

**Files:**
- Create: `packages/react/src/Stack/Stack.tsx`, `Stack.module.css`, `Stack.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성 — `src/Stack/Stack.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders children inside a flex container", () => {
    render(
      <Stack>
        <span>child</span>
      </Stack>,
    );
    const stack = screen.getByText("child").parentElement as HTMLElement;
    expect(stack).toHaveStyle({ display: "flex" });
  });

  it("applies direction and gap from props", () => {
    render(
      <Stack direction="row" gap={4}>
        <span>x</span>
      </Stack>,
    );
    const stack = screen.getByText("x").parentElement as HTMLElement;
    expect(stack).toHaveAttribute("data-direction", "row");
    expect(stack).toHaveStyle({ flexDirection: "row", gap: "var(--spacing-4)" });
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL (`./Stack` 없음).

- [ ] **Step 3: `src/Stack/Stack.module.css` 작성**

```css
.stack { box-sizing: border-box; }
```

- [ ] **Step 4: `src/Stack/Stack.tsx` 작성**

```tsx
import type { CSSProperties, ReactNode } from "react";
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

const spacingValue = (n: SpacingScale): string =>
  n === 0 ? "0" : `var(--spacing-${n})`;

export function Stack({
  children,
  direction = "column",
  gap = 0,
  padding = 0,
  align,
  justify,
  className,
}: StackProps) {
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
      data-direction={direction}
      className={[styles.stack, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts`에 export 추가**

`src/index.ts` 끝에 아래 두 줄 추가:

```ts
export { Stack } from "./Stack/Stack";
export type { StackProps, SpacingScale } from "./Stack/Stack";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → PASS.
```bash
git add packages/react/src/Stack packages/react/src/index.ts
git commit -m "feat(react): add Stack layout component"
```

---

## Task 6: Switch 컴포넌트 (TDD)

**Files:**
- Create: `packages/react/src/Switch/Switch.tsx`, `Switch.module.css`, `Switch.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 실패 테스트 작성 — `src/Switch/Switch.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("exposes the switch role and checked state", () => {
    render(<Switch checked aria-label="wifi" />);
    expect(screen.getByRole("switch", { name: "wifi" })).toBeChecked();
  });

  it("calls onChange with the toggled value", async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} aria-label="wifi" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange} disabled aria-label="wifi" />,
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react test` → FAIL (`./Switch` 없음).

- [ ] **Step 3: `src/Switch/Switch.module.css` 작성**

```css
.switch {
  position: relative;
  width: 52px;
  height: 32px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  cursor: pointer;
  padding: 2px;
  transition: background-color 0.15s ease;
}
.switch[data-checked="true"] { background: var(--color-brand-primary); }
.switch:disabled { opacity: 0.4; cursor: not-allowed; }
.thumb {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-white);
  transition: transform 0.15s ease;
}
.switch[data-checked="true"] .thumb { transform: translateX(20px); }
```

- [ ] **Step 4: `src/Switch/Switch.tsx` 작성**

```tsx
import type { ButtonHTMLAttributes } from "react";
import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  className,
  ...rest
}: SwitchProps) {
  return (
    <button
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
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/react test` → PASS.

- [ ] **Step 6: `src/index.ts`에 export 추가**

`src/index.ts` 끝에 아래 두 줄 추가:

```ts
export { Switch } from "./Switch/Switch";
export type { SwitchProps } from "./Switch/Switch";
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/react typecheck` → PASS.
```bash
git add packages/react/src/Switch packages/react/src/index.ts
git commit -m "feat(react): add Switch component"
```

---

## Task 7: 라이브러리 빌드 검증 + README

**Files:**
- Create: `packages/react/README.md`
- (빌드 산출물 `dist/`는 gitignore됨)

- [ ] **Step 1: 라이브러리 빌드 실행**

Run: `pnpm --filter @superbase/react build`
Expected: Vite가 `dist/index.js`, `dist/index.d.ts`(및 컴포넌트별 `.d.ts`), `dist/style.css`를 생성. 빌드 성공(exit 0).

검증: 다음 파일이 존재하는지 확인하라.
```bash
ls packages/react/dist/index.js packages/react/dist/index.d.ts packages/react/dist/style.css
```
모두 존재해야 한다. 만약 CSS 파일명이 `style.css`가 아니라면(예: Vite 버전 차이로 다른 이름) 실제 생성된 CSS 파일명을 확인하고, `packages/react/package.json`의 `exports["./styles.css"]`와 `build.lib.cssFileName`(vite.config.ts)을 실제 파일명에 맞게 정렬한 뒤 다시 빌드해 일치시켜라. 무엇을 바꿨는지 보고하라.

- [ ] **Step 2: 빌드 산출물의 export 무결성 확인**

`dist/index.js`에 `Text`, `Button`, `TextField`, `Stack`, `Switch`가 export되는지 확인:
```bash
node --input-type=module -e "import('./packages/react/dist/index.js').then(m => console.log(Object.keys(m).sort()))"
```
Expected 출력에 `Button`, `Stack`, `Switch`, `Text`, `TextField`가 모두 포함되어야 한다. (React를 외부 의존성으로 두었으므로 import는 성공해야 한다. 만약 react resolve 에러가 나면 `rollupOptions.external` 설정을 점검하라.)

- [ ] **Step 3: `packages/react/README.md` 작성**

```markdown
# @superbase/react

웹용 React 컴포넌트. 디자인 토큰(CSS 변수)을 소비한다.

## 설치 / 사용

소비 앱에서 토큰 CSS와 컴포넌트 스타일을 함께 로드한다:

    import "@superbase/tokens/css";   // CSS 변수 (:root + [data-theme="dark"])
    import "@superbase/react/styles.css"; // 컴포넌트 스타일
    import { Button, Text } from "@superbase/react";

## 컴포넌트

- `Text` — variant(caption/body/title/display), weight, color
- `Button` — variant(primary/secondary), size(sm/md/lg)
- `TextField` — label, error, value, onChange(value: string)
- `Stack` — direction, gap, padding(spacing scale), align, justify
- `Switch` — checked, onChange(checked: boolean), disabled

다크 테마는 소비 앱에서 최상위 요소에 `data-theme="dark"`를 설정하면 적용된다.
```

- [ ] **Step 4: 전체 turbo 검증**

Run: `pnpm turbo run typecheck test build`
Expected: tokens + react 패키지의 typecheck/test/build가 모두 성공. react 테스트(스모크 1 + 컴포넌트 13 = 14개) 통과.

- [ ] **Step 5: Commit**

```bash
git add packages/react/README.md
git commit -m "docs(react): add README and verify library build"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 에러 없이 통과한다.
- `@superbase/react`가 Text, Button, TextField, Stack, Switch 5종을 export한다.
- 각 컴포넌트는 토큰 CSS 변수를 참조하고, 테스트는 role/접근성/동작/data 속성으로 행동을 검증한다.
- `vite build`가 `dist/index.js` + `dist/index.d.ts` + `dist/style.css`를 생성하고 패키지 `exports`가 이를 가리킨다.

## 다음 플랜

- **Plan 3**: `apps/docs` — Next.js 커스텀 문서 사이트. `@superbase/tokens/css` + `@superbase/react`를 소비해 Foundations(토큰)·Components(라이브 렌더)·Getting Started를 보여주고 light/dark 토글을 시연.
- **Plan 4**: `@superbase/react-native` — 동일 API의 모바일 컴포넌트(토큰 TS 소비).
