# Header Component + bar/floating Variant Unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cross-platform `Header` compound component and introduce a unified `variant="bar" | "floating"` API to both `Header` and the existing `BottomNavigation`.

**Architecture:** Mirror the established compound-component pattern (presence-context guard + `forwardRef` root) used by Tabs/Modal/BottomNavigation. Web uses CSS Modules with `data-variant` attribute selectors and token CSS vars; React Native uses inline styles + `useTheme()` with a variant style branch. `variant` controls only the root container styling (border/radius/shadow/margin); inner layout is identical across variants.

**Tech Stack:** TypeScript, React 18, React Native (tested via `react-native-web`), Vitest + Testing Library, CSS Modules, Style Dictionary tokens, Next.js App Router docs, changesets.

**Spec:** `docs/superpowers/specs/2026-06-24-header-and-bar-variants-design.md`

---

## Conventions (read once)

- **Spacing scale has no 5 or 7.** Only `--spacing-0/1/2/3/4/6/8` (RN `t.spacing["0".."8"]` with those keys). Never use `--spacing-5`/`t.spacing["5"]`.
- Verified tokens this plan uses (all exist): `--color-status-danger` (`t.color.status.danger`), `--color-border-default`, `--color-background-default`, `--color-background-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-brand-primary`, `--radius-lg`, `--radius-full`, `--shadow-sm` (`t.shadow.sm`), `--border-width-thin` (`t.borderWidth.thin`), `--size-field-sm` (`t.size.fieldSm`), `--font-size-body`, `--font-weight-bold`, `--font-size-caption`, `--line-height-body`, `--line-height-caption`, `--focus-ring-width/color/offset`.
- Components are exported directly from each package's `src/index.ts` (there are **no** per-folder `index.ts` files — do not create them).
- Test commands: `pnpm --filter @superbase/icons test`, `pnpm --filter @superbase/react test`, `pnpm --filter @superbase/react-native test`, `pnpm --filter @superbase/docs test`. Typecheck: `pnpm --filter <pkg> typecheck`.
- RN tests import from `@testing-library/react` and `react-native` (aliased to `react-native-web`); `accessibilityLabel` is queried with `getByLabelText`, `onPress` fires on `fireEvent.click`.

---

## Task 1: Add `bell` icon

**Files:**
- Modify: `packages/icons/src/index.ts` (add to `iconPaths`)
- Test: `packages/icons/src/index.test.ts`

- [ ] **Step 1: Update the count + inclusion tests**

In `packages/icons/src/index.test.ts`, change the count from 23 to 24 and add `bell` to the navigation-icons inclusion list:

```ts
  it("exposes 24 icons", () => {
    expect(iconNames).toHaveLength(24);
  });

  it("includes the navigation icons", () => {
    for (const n of ["home", "calendar", "users", "chat", "arrow-left", "bell"] as const) {
      expect(iconNames).toContain(n);
    }
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @superbase/icons test`
Expected: FAIL — count is 23, `bell` not found.

- [ ] **Step 3: Add the `bell` path**

In `packages/icons/src/index.ts`, add this entry to the `iconPaths` object (e.g. right after the `"arrow-left"` line, before the closing `} as const;`):

```ts
  bell: "M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13zM10 20a2 2 0 0 0 4 0",
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @superbase/icons test`
Expected: PASS (24 icons, includes bell, every path non-empty, keys match).

- [ ] **Step 5: Visually verify the glyph**

Render the bell to a PNG and inspect it looks like a bell (rounded body, flared bottom, clapper arc below):

```bash
cat > /tmp/bell.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13zM10 20a2 2 0 0 0 4 0"/></svg>
EOF
qlmanage -t -s 256 -o /tmp /tmp/bell.svg >/dev/null 2>&1 && echo "rendered /tmp/bell.svg.png"
```

Read `/tmp/bell.svg.png`. If the shape is off, tune the path and re-run Steps 4–5. Once it reads as a bell, continue.

- [ ] **Step 6: Commit**

```bash
git add packages/icons/src/index.ts packages/icons/src/index.test.ts
git commit -m "feat(icons): add bell icon"
```

---

## Task 2: Header — Web component

**Files:**
- Create: `packages/react/src/Header/HeaderContext.ts`
- Create: `packages/react/src/Header/Header.tsx`
- Create: `packages/react/src/Header/HeaderBrand.tsx`
- Create: `packages/react/src/Header/HeaderTitle.tsx`
- Create: `packages/react/src/Header/HeaderActions.tsx`
- Create: `packages/react/src/Header/HeaderAction.tsx`
- Create: `packages/react/src/Header/Header.module.css`
- Create: `packages/react/src/Header/Header.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/react/src/Header/Header.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderTitle } from "./HeaderTitle";
import { HeaderActions } from "./HeaderActions";
import { HeaderAction } from "./HeaderAction";

describe("Header", () => {
  it("renders title and subtitle", () => {
    render(
      <Header>
        <HeaderTitle title="오늘의대회" subtitle="Smash today" />
      </Header>,
    );
    expect(screen.getByText("오늘의대회")).toBeInTheDocument();
    expect(screen.getByText("Smash today")).toBeInTheDocument();
  });

  it("exposes a banner landmark with default aria-label", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.getByRole("banner", { name: "앱 헤더" })).toBeInTheDocument();
  });

  it("renders no back button by default", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.queryByRole("button", { name: "뒤로" })).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<Header onBack={onBack}><HeaderTitle title="T" /></Header>);
    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders an action with aria-label and fires its handler", () => {
    const onClick = vi.fn();
    render(
      <Header>
        <HeaderTitle title="T" />
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" onClick={onClick} />
        </HeaderActions>
      </Header>,
    );
    fireEvent.click(screen.getByRole("button", { name: "알림" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a badge dot only when badge is set", () => {
    const { container, rerender } = render(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" />
        </HeaderActions>
      </Header>,
    );
    expect(container.querySelector('[data-badge="true"]')).toBeNull();
    rerender(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<span>i</span>} label="알림" badge />
        </HeaderActions>
      </Header>,
    );
    expect(container.querySelector('[data-badge="true"]')).not.toBeNull();
  });

  it("defaults to the bar variant and accepts floating", () => {
    const { container, rerender } = render(<Header><HeaderTitle title="T" /></Header>);
    expect(container.querySelector('[data-variant="bar"]')).not.toBeNull();
    rerender(<Header variant="floating"><HeaderTitle title="T" /></Header>);
    expect(container.querySelector('[data-variant="floating"]')).not.toBeNull();
  });

  it("throws when a part is used outside <Header>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<HeaderTitle title="T" />)).toThrow();
    expect(() => render(<HeaderBrand>b</HeaderBrand>)).toThrow();
    expect(() => render(<HeaderActions>a</HeaderActions>)).toThrow();
    expect(() => render(<HeaderAction icon={<span>i</span>} label="x" />)).toThrow();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @superbase/react test -- Header`
Expected: FAIL — modules `./Header` etc. do not exist.

- [ ] **Step 3: Create the context + guard**

Create `packages/react/src/Header/HeaderContext.ts`:

```ts
import { createContext, useContext } from "react";

// Presence marker only — Header parts share no state; the context exists
// purely to enforce composition (parts must render inside <Header>).
export type HeaderContextValue = Record<string, never>;

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeaderContext(): HeaderContextValue {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("Header 컴파운드 컴포넌트는 <Header> 내부에서 사용해야 합니다");
  return ctx;
}
```

- [ ] **Step 4: Create the root component**

Create `packages/react/src/Header/Header.tsx`:

```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { HeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export type HeaderVariant = "bar" | "floating";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  variant?: HeaderVariant;
  onBack?: () => void;
  children: ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { variant = "bar", onBack, children, className, "aria-label": ariaLabel = "앱 헤더", ...rest },
  ref,
) {
  return (
    <header
      ref={ref}
      aria-label={ariaLabel}
      data-variant={variant}
      className={[styles.header, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {onBack && (
        <button type="button" className={styles.back} aria-label="뒤로" onClick={onBack}>
          <Icon name="arrow-left" size="sm" />
        </button>
      )}
      <HeaderContext.Provider value={{}}>{children}</HeaderContext.Provider>
    </header>
  );
});
```

- [ ] **Step 5: Create the brand slot**

Create `packages/react/src/Header/HeaderBrand.tsx`:

```tsx
import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderBrandProps {
  children: ReactNode;
}

export function HeaderBrand({ children }: HeaderBrandProps) {
  useHeaderContext();
  return <div className={styles.brand}>{children}</div>;
}
```

- [ ] **Step 6: Create the title**

Create `packages/react/src/Header/HeaderTitle.tsx`:

```tsx
import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export function HeaderTitle({ title, subtitle }: HeaderTitleProps) {
  useHeaderContext();
  return (
    <div className={styles.title}>
      <span className={styles.titleText}>{title}</span>
      {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
}
```

- [ ] **Step 7: Create the actions container**

Create `packages/react/src/Header/HeaderActions.tsx`:

```tsx
import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderActionsProps {
  children: ReactNode;
}

export function HeaderActions({ children }: HeaderActionsProps) {
  useHeaderContext();
  return <div className={styles.actions}>{children}</div>;
}
```

- [ ] **Step 8: Create the action button**

Create `packages/react/src/Header/HeaderAction.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: ReactNode;
  label: string;
  badge?: boolean;
}

export const HeaderAction = forwardRef<HTMLButtonElement, HeaderActionProps>(function HeaderAction(
  { icon, label, badge = false, className, ...rest },
  ref,
) {
  useHeaderContext();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={[styles.action, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      {badge && <span className={styles.badge} data-badge="true" aria-hidden="true" />}
    </button>
  );
});
```

- [ ] **Step 9: Create the styles**

Create `packages/react/src/Header/Header.module.css`:

```css
.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-background-default);
}
.header[data-variant="bar"] {
  border-bottom: var(--border-width-thin) solid var(--color-border-default);
}
.header[data-variant="floating"] {
  border-radius: var(--radius-lg);
  border: var(--border-width-thin) solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
  margin: var(--spacing-3);
}
.brand {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}
.title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.titleText {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-body);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.subtitle {
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}
.action {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-field-sm);
  height: var(--size-field-sm);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}
.action:hover { background: var(--color-background-subtle); }
.action:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.badge {
  position: absolute;
  top: var(--spacing-1);
  right: var(--spacing-1);
  width: var(--spacing-2);
  height: var(--spacing-2);
  border-radius: var(--radius-full);
  background: var(--color-status-danger);
  border: var(--border-width-thin) solid var(--color-background-default);
}
.back {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-field-sm);
  height: var(--size-field-sm);
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-background-subtle);
  color: var(--color-text-primary);
  cursor: pointer;
}
.back:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

- [ ] **Step 10: Export from the package entry**

In `packages/react/src/index.ts`, add after the BottomNavigation exports (around line 50):

```ts
export { Header } from "./Header/Header";
export type { HeaderProps, HeaderVariant } from "./Header/Header";
export { HeaderBrand } from "./Header/HeaderBrand";
export type { HeaderBrandProps } from "./Header/HeaderBrand";
export { HeaderTitle } from "./Header/HeaderTitle";
export type { HeaderTitleProps } from "./Header/HeaderTitle";
export { HeaderActions } from "./Header/HeaderActions";
export type { HeaderActionsProps } from "./Header/HeaderActions";
export { HeaderAction } from "./Header/HeaderAction";
export type { HeaderActionProps } from "./Header/HeaderAction";
```

- [ ] **Step 11: Run the test to verify it passes**

Run: `pnpm --filter @superbase/react test -- Header`
Expected: PASS (all Header tests).

- [ ] **Step 12: Typecheck**

Run: `pnpm --filter @superbase/react typecheck`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add packages/react/src/Header packages/react/src/index.ts
git commit -m "feat(react): Header compound component (bar/floating variant, back, badge)"
```

---

## Task 3: Header — React Native component

**Files:**
- Create: `packages/react-native/src/Header/HeaderContext.ts`
- Create: `packages/react-native/src/Header/Header.tsx`
- Create: `packages/react-native/src/Header/HeaderBrand.tsx`
- Create: `packages/react-native/src/Header/HeaderTitle.tsx`
- Create: `packages/react-native/src/Header/HeaderActions.tsx`
- Create: `packages/react-native/src/Header/HeaderAction.tsx`
- Create: `packages/react-native/src/Header/Header.test.tsx`
- Modify: `packages/react-native/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/react-native/src/Header/Header.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Text } from "react-native";
import { Header } from "./Header";
import { HeaderTitle } from "./HeaderTitle";
import { HeaderActions } from "./HeaderActions";
import { HeaderAction } from "./HeaderAction";

describe("Header (RN)", () => {
  it("renders title and subtitle", () => {
    render(<Header><HeaderTitle title="오늘의대회" subtitle="Smash today" /></Header>);
    expect(screen.getByText("오늘의대회")).toBeInTheDocument();
    expect(screen.getByText("Smash today")).toBeInTheDocument();
  });

  it("renders no back button by default", () => {
    render(<Header><HeaderTitle title="T" /></Header>);
    expect(screen.queryByLabelText("뒤로")).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<Header onBack={onBack}><HeaderTitle title="T" /></Header>);
    fireEvent.click(screen.getByLabelText("뒤로"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("fires the action handler and exposes its accessibility label", () => {
    const onPress = vi.fn();
    render(
      <Header>
        <HeaderActions>
          <HeaderAction icon={<Text>i</Text>} label="알림" onPress={onPress} />
        </HeaderActions>
      </Header>,
    );
    fireEvent.click(screen.getByLabelText("알림"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders both variants without crashing", () => {
    const { rerender } = render(<Header variant="bar"><HeaderTitle title="T" /></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
    rerender(<Header variant="floating"><HeaderTitle title="T" /></Header>);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("throws when a part is used outside <Header>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<HeaderTitle title="T" />)).toThrow();
    expect(() => render(<HeaderAction icon={<Text>i</Text>} label="x" />)).toThrow();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @superbase/react-native test -- Header`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Create the context + guard**

Create `packages/react-native/src/Header/HeaderContext.ts` (identical logic to web):

```ts
import { createContext, useContext } from "react";

export type HeaderContextValue = Record<string, never>;

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeaderContext(): HeaderContextValue {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("Header 컴파운드 컴포넌트는 <Header> 내부에서 사용해야 합니다");
  return ctx;
}
```

- [ ] **Step 4: Create the root component**

Create `packages/react-native/src/Header/Header.tsx`:

```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Pressable, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { HeaderContext } from "./HeaderContext";

export type HeaderVariant = "bar" | "floating";

export interface HeaderProps extends ViewProps {
  variant?: HeaderVariant;
  onBack?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Header = forwardRef<ElementRef<typeof View>, HeaderProps>(function Header(
  { variant = "bar", onBack, children, "aria-label": ariaLabel = "앱 헤더", style, ...rest },
  ref,
) {
  const t = useTheme();
  const variantStyle: ViewStyle =
    variant === "floating"
      ? {
          borderRadius: t.radius.lg,
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border.default,
          margin: t.spacing["3"],
          ...t.shadow.sm,
        }
      : {
          borderBottomWidth: t.borderWidth.thin,
          borderBottomColor: t.color.border.default,
        };
  return (
    <View
      ref={ref}
      accessibilityLabel={ariaLabel}
      {...rest}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["3"],
          paddingHorizontal: t.spacing["4"],
          paddingVertical: t.spacing["3"],
          backgroundColor: t.color.background.default,
        },
        variantStyle,
        style,
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={onBack}
          style={{
            width: t.size.fieldSm,
            height: t.size.fieldSm,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.full,
            backgroundColor: t.color.background.subtle,
          }}
        >
          <Icon name="arrow-left" size="sm" color={t.color.text.primary} />
        </Pressable>
      ) : null}
      <HeaderContext.Provider value={{}}>{children}</HeaderContext.Provider>
    </View>
  );
});
```

- [ ] **Step 5: Create the brand slot**

Create `packages/react-native/src/Header/HeaderBrand.tsx`:

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderBrandProps {
  children: ReactNode;
}

export function HeaderBrand({ children }: HeaderBrandProps) {
  useHeaderContext();
  return <View style={{ flexShrink: 0 }}>{children}</View>;
}
```

- [ ] **Step 6: Create the title**

Create `packages/react-native/src/Header/HeaderTitle.tsx`:

```tsx
import type { ReactNode } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export function HeaderTitle({ title, subtitle }: HeaderTitleProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <RNText
        numberOfLines={1}
        style={{
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
          color: t.color.text.primary,
        }}
      >
        {title}
      </RNText>
      {subtitle != null && (
        <RNText
          numberOfLines={1}
          style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}
        >
          {subtitle}
        </RNText>
      )}
    </View>
  );
}
```

- [ ] **Step 7: Create the actions container**

Create `packages/react-native/src/Header/HeaderActions.tsx`:

```tsx
import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderActionsProps {
  children: ReactNode;
}

export function HeaderActions({ children }: HeaderActionsProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <View style={{ flexShrink: 0, flexDirection: "row", alignItems: "center", gap: t.spacing["1"] }}>
      {children}
    </View>
  );
}
```

- [ ] **Step 8: Create the action button**

Create `packages/react-native/src/Header/HeaderAction.tsx`:

```tsx
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderActionProps {
  icon: ReactNode;
  label: string;
  badge?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function HeaderAction({ icon, label, badge = false, onPress, disabled = false }: HeaderActionProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: t.size.fieldSm,
        height: t.size.fieldSm,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t.radius.full,
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View>{icon}</View>
      {badge ? (
        <View
          style={{
            position: "absolute",
            top: t.spacing["1"],
            right: t.spacing["1"],
            width: t.spacing["2"],
            height: t.spacing["2"],
            borderRadius: t.radius.full,
            backgroundColor: t.color.status.danger,
            borderWidth: t.borderWidth.thin,
            borderColor: t.color.background.default,
          }}
        />
      ) : null}
    </Pressable>
  );
}
```

- [ ] **Step 9: Export from the package entry**

In `packages/react-native/src/index.ts`, add after the BottomNavigation exports (around line 54):

```ts
export { Header } from "./Header/Header";
export type { HeaderProps, HeaderVariant } from "./Header/Header";
export { HeaderBrand } from "./Header/HeaderBrand";
export type { HeaderBrandProps } from "./Header/HeaderBrand";
export { HeaderTitle } from "./Header/HeaderTitle";
export type { HeaderTitleProps } from "./Header/HeaderTitle";
export { HeaderActions } from "./Header/HeaderActions";
export type { HeaderActionsProps } from "./Header/HeaderActions";
export { HeaderAction } from "./Header/HeaderAction";
export type { HeaderActionProps } from "./Header/HeaderAction";
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `pnpm --filter @superbase/react-native test -- Header`
Expected: PASS.

- [ ] **Step 11: Typecheck**

Run: `pnpm --filter @superbase/react-native typecheck`
Expected: no errors. (If `t.opacity.disabled` does not exist, remove the `opacity` line from HeaderAction — it mirrors BottomNavigationItem which uses `t.opacity.disabled`, so it should exist.)

- [ ] **Step 12: Commit**

```bash
git add packages/react-native/src/Header packages/react-native/src/index.ts
git commit -m "feat(react-native): Header compound component (bar/floating variant, back, badge)"
```

---

## Task 4: BottomNavigation variant — Web

**Files:**
- Modify: `packages/react/src/BottomNavigation/BottomNavigation.tsx`
- Modify: `packages/react/src/BottomNavigation/BottomNavigation.module.css`
- Modify: `packages/react/src/BottomNavigation/BottomNavigation.test.tsx`

- [ ] **Step 1: Add the failing variant test**

Append this test inside the `describe("BottomNavigation", ...)` block in `packages/react/src/BottomNavigation/BottomNavigation.test.tsx` (the `items()` helper already exists in that file):

```tsx
  it("defaults to the bar variant and accepts floating", () => {
    const { container, rerender } = render(
      <BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>,
    );
    expect(container.querySelector('[data-variant="bar"]')).not.toBeNull();
    rerender(
      <BottomNavigation value="home" onChange={() => {}} variant="floating">{items()}</BottomNavigation>,
    );
    expect(container.querySelector('[data-variant="floating"]')).not.toBeNull();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @superbase/react test -- BottomNavigation`
Expected: FAIL — no `data-variant` attribute on the rendered nav.

- [ ] **Step 3: Restructure the CSS**

In `packages/react/src/BottomNavigation/BottomNavigation.module.css`, replace the existing `.bar { ... }` block (lines 1–9) with a `.root` base + variant attribute selectors. Leave `.item`, `.back`, `.divider`, `.label`, and all other rules unchanged:

```css
.root {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background-default);
}
.root[data-variant="bar"] {
  border-top: var(--border-width-thin) solid var(--color-border-default);
}
.root[data-variant="floating"] {
  border-radius: var(--radius-full);
  border: var(--border-width-thin) solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 4: Add the variant prop to the component**

In `packages/react/src/BottomNavigation/BottomNavigation.tsx`, replace the props interface, the function signature, and the `<nav>` opening tag so it accepts `variant` (default `"bar"`), sets `data-variant`, and uses `styles.root`:

```tsx
export type BottomNavigationVariant = "bar" | "floating";

export interface BottomNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  variant?: BottomNavigationVariant;
  children: ReactNode;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, variant = "bar", children, className, "aria-label": ariaLabel = "Bottom navigation", ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      data-variant={variant}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...rest}
    >
```

(Leave the back-button/divider block, the context provider, and the closing tags unchanged.)

- [ ] **Step 5: Export the new type**

In `packages/react/src/index.ts`, update the BottomNavigation type export line to also export the variant type:

```ts
export type { BottomNavigationProps, BottomNavigationVariant } from "./BottomNavigation/BottomNavigation";
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm --filter @superbase/react test -- BottomNavigation`
Expected: PASS (all existing BottomNavigation tests + the new variant test).

- [ ] **Step 7: Typecheck**

Run: `pnpm --filter @superbase/react typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/BottomNavigation packages/react/src/index.ts
git commit -m "feat(react): BottomNavigation bar/floating variant (default bar)"
```

---

## Task 5: BottomNavigation variant — React Native

**Files:**
- Modify: `packages/react-native/src/BottomNavigation/BottomNavigation.tsx`
- Modify: `packages/react-native/src/BottomNavigation/BottomNavigation.test.tsx`

- [ ] **Step 1: Add the failing smoke test**

Append this test inside the `describe("BottomNavigation (RN)", ...)` block in `packages/react-native/src/BottomNavigation/BottomNavigation.test.tsx` (the `items()` helper already exists):

```tsx
  it("renders both variants without crashing", () => {
    const { rerender } = render(
      <BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>,
    );
    expect(screen.getByText("home-on")).toBeInTheDocument();
    rerender(
      <BottomNavigation value="home" onChange={() => {}} variant="floating">{items()}</BottomNavigation>,
    );
    expect(screen.getByText("home-on")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @superbase/react-native test -- BottomNavigation`
Expected: FAIL — TypeScript/prop error: `variant` is not a known prop (the test file won't compile, or `variant` is ignored). If it unexpectedly passes (prop silently ignored), proceed; the real assertion is the variant styling added next.

- [ ] **Step 3: Add the variant prop + style branch**

In `packages/react-native/src/BottomNavigation/BottomNavigation.tsx`:

(a) Replace the props interface to add `variant`:

```tsx
export type BottomNavigationVariant = "bar" | "floating";

export interface BottomNavigationProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  variant?: BottomNavigationVariant;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}
```

(b) Update the function signature to destructure `variant` (default `"bar"`):

```tsx
export const BottomNavigation = forwardRef<ElementRef<typeof View>, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, variant = "bar", children, "aria-label": ariaLabel = "Bottom navigation", style, ...rest },
  ref,
) {
```

(c) Inside the function body, before the `return`, compute the variant style:

```tsx
  const t = useTheme();
  const variantStyle: ViewStyle =
    variant === "floating"
      ? {
          borderRadius: t.radius.full,
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border.default,
          ...t.shadow.sm,
        }
      : {
          borderTopWidth: t.borderWidth.thin,
          borderTopColor: t.color.border.default,
        };
```

(d) Replace the root `<View>`'s `style` array. The base object must **no longer** include `borderRadius`/`...t.shadow.lg` (those move into the floating branch). The new style prop is:

```tsx
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["1"],
          paddingHorizontal: t.spacing["3"],
          paddingVertical: t.spacing["2"],
          backgroundColor: t.color.background.default,
        },
        variantStyle,
        style,
      ]}
```

(Keep the existing `const t = useTheme();` only once — if it already exists at the top of the body, do not duplicate it; just add the `variantStyle` computation after it.)

- [ ] **Step 4: Export the new type**

In `packages/react-native/src/index.ts`, update the BottomNavigation type export line:

```ts
export type { BottomNavigationProps, BottomNavigationVariant } from "./BottomNavigation/BottomNavigation";
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @superbase/react-native test -- BottomNavigation`
Expected: PASS.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @superbase/react-native typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/react-native/src/BottomNavigation packages/react-native/src/index.ts
git commit -m "feat(react-native): BottomNavigation bar/floating variant (default bar)"
```

---

## Task 6: Docs — Header page, BottomNavigation variant demos, nav entry

**Files:**
- Create: `apps/docs/app/components/header/page.tsx`
- Modify: `apps/docs/app/components/bottom-navigation/page.tsx`
- Modify: `apps/docs/components/docs/componentNav.ts`
- Modify: `apps/docs/components/docs/componentNav.test.ts`

- [ ] **Step 1: Update the nav test (failing)**

In `apps/docs/components/docs/componentNav.test.ts`, change the length to 17 and add a `header` assertion:

```ts
    expect(componentNav).toHaveLength(17);
    expect(componentNav.map((c) => c.slug)).toContain("header");
```

(Add the `toContain("header")` line alongside the other `toContain` assertions.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @superbase/docs test -- componentNav`
Expected: FAIL — length is 16, `header` missing.

- [ ] **Step 3: Add the nav entry**

In `apps/docs/components/docs/componentNav.ts`, insert the `header` entry between `checkbox` and `icon` (keeps the existing alphabetical ordering):

```ts
  { slug: "checkbox", label: "Checkbox" },
  { slug: "header", label: "Header" },
  { slug: "icon", label: "Icon" },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @superbase/docs test -- componentNav`
Expected: PASS (17 items, includes header).

- [ ] **Step 5: Create the Header docs page**

Create `apps/docs/app/components/header/page.tsx`:

```tsx
"use client";
import {
  Header as WebHeader,
  HeaderBrand as WebHeaderBrand,
  HeaderTitle as WebHeaderTitle,
  HeaderActions as WebHeaderActions,
  HeaderAction as WebHeaderAction,
  Icon as WebIcon,
} from "@superbase/react";
import {
  Header as RNHeader,
  HeaderBrand as RNHeaderBrand,
  HeaderTitle as RNHeaderTitle,
  HeaderActions as RNHeaderActions,
  HeaderAction as RNHeaderAction,
  Icon as RNIcon,
  useTheme as useRNTheme,
} from "@superbase/react-native";
import { View } from "react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const frame: React.CSSProperties = {
  background: "var(--color-background-subtle)",
  padding: "var(--spacing-6) var(--spacing-4)",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};
const barStyle = { width: "100%", maxWidth: 420 } as const;

function WebBrand() {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        background: "var(--color-brand-primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <WebIcon name="star" color="#fff" />
    </span>
  );
}

function WebDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  return (
    <div style={frame}>
      <WebHeader variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <WebHeaderBrand><WebBrand /></WebHeaderBrand>
        <WebHeaderTitle title="오늘의대회" subtitle="Smash today" />
        <WebHeaderActions>
          <WebHeaderAction icon={<WebIcon name="bell" />} label="알림" badge />
          <WebHeaderAction icon={<WebIcon name="settings" />} label="설정" />
        </WebHeaderActions>
      </WebHeader>
    </div>
  );
}

function RNBrand() {
  const t = useRNTheme();
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        backgroundColor: t.color.brand.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RNIcon name="star" color="#fff" />
    </View>
  );
}

function RNDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  return (
    <div style={frame}>
      <RNHeader variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <RNHeaderBrand><RNBrand /></RNHeaderBrand>
        <RNHeaderTitle title="오늘의대회" subtitle="Smash today" />
        <RNHeaderActions>
          <RNHeaderAction icon={<RNIcon name="bell" />} label="알림" badge />
          <RNHeaderAction icon={<RNIcon name="settings" />} label="설정" />
        </RNHeaderActions>
      </RNHeader>
    </div>
  );
}

const webContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<><Code>variant</Code> 기본값은 <Code>"bar"</Code>로, 화면 폭을 꽉 채우고 하단 보더가 있는 표준 헤더입니다. 우측 <Code>HeaderAction</Code>의 <Code>badge</Code>로 빨간 알림 점을 표시합니다.</>}
      code={`<Header>
  <HeaderBrand>{/* 로고/아바타 */}</HeaderBrand>
  <HeaderTitle title="오늘의대회" subtitle="Smash today" />
  <HeaderActions>
    <HeaderAction icon={<Icon name="bell" />} label="알림" badge />
    <HeaderAction icon={<Icon name="settings" />} label="설정" />
  </HeaderActions>
</Header>`}
    >
      <WebDemo />
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>은 라운드 + 보더 + 은은한 그림자로 카드처럼 띄웁니다.</>}
      code={`<Header variant="floating">…</Header>`}
    >
      <WebDemo variant="floating" />
    </Example>
    <Example
      title="뒤로가기"
      description={<><Code>onBack</Code>을 주면 좌측에 뒤로가기 버튼이 생깁니다.</>}
      code={`<Header onBack={goBack}>…</Header>`}
    >
      <WebDemo withBack />
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<>RN도 동일 API. <Code>icon</Code> 색은 <Code>useTheme()</Code>로 가져옵니다.</>}
      code={`<Header>
  <HeaderBrand>{/* 로고/아바타 */}</HeaderBrand>
  <HeaderTitle title="오늘의대회" subtitle="Smash today" />
  <HeaderActions>
    <HeaderAction icon={<Icon name="bell" />} label="알림" badge />
    <HeaderAction icon={<Icon name="settings" />} label="설정" />
  </HeaderActions>
</Header>`}
    >
      <ClientOnly><RNDemo /></ClientOnly>
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>으로 카드형 헤더를 만듭니다.</>}
      code={`<Header variant="floating">…</Header>`}
    >
      <ClientOnly><RNDemo variant="floating" /></ClientOnly>
    </Example>
    <Example
      title="뒤로가기"
      description={<><Code>onBack</Code>으로 뒤로가기 버튼을 표시합니다.</>}
      code={`<Header onBack={goBack}>…</Header>`}
    >
      <ClientOnly><RNDemo withBack /></ClientOnly>
    </Example>
  </>
);

export default function HeaderPage() {
  return (
    <ComponentDoc title="Header" lead="앱 상단 헤더. 브랜드/타이틀/액션을 조합하며 bar·floating 두 룩과 뒤로가기를 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 6: Update the BottomNavigation docs page to show both variants**

Overwrite `apps/docs/app/components/bottom-navigation/page.tsx` with the version below. Changes vs current: `WebDemo`/`RNDemo` accept a `variant` prop, and a new "플로팅 (floating)" example is added before the back example; the "기본" example is relabeled "기본 (bar)".

```tsx
"use client";
import { useState } from "react";
import {
  BottomNavigation as WebBottomNavigation,
  BottomNavigationItem as WebBottomNavigationItem,
  Icon as WebIcon,
} from "@superbase/react";
import {
  BottomNavigation as RNBottomNavigation,
  BottomNavigationItem as RNBottomNavigationItem,
  Icon as RNIcon,
  useTheme as useRNTheme,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const frame: React.CSSProperties = {
  background: "var(--color-background-subtle)",
  padding: "var(--spacing-6) var(--spacing-4)",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const barStyle = { width: "100%", maxWidth: 420 } as const;

function WebDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const wi = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <WebIcon name={name} color={active ? "var(--color-brand-primary)" : "var(--color-text-secondary)"} />
  );
  return (
    <div style={frame}>
      <WebBottomNavigation value={value} onChange={setValue} variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <WebBottomNavigationItem value="home" label="홈" icon={wi("home")} />
        <WebBottomNavigationItem value="calendar" label="일정" icon={wi("calendar")} />
        <WebBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={wi("users")} />
        <WebBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={wi(withBack ? "chat" : "user")} />
      </WebBottomNavigation>
    </div>
  );
}

function RNDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const t = useRNTheme();
  const ri = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <RNIcon name={name} color={active ? t.color.brand.primary : t.color.text.secondary} />
  );
  return (
    <div style={frame}>
      <RNBottomNavigation value={value} onChange={setValue} variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <RNBottomNavigationItem value="home" label="홈" icon={ri("home")} />
        <RNBottomNavigationItem value="calendar" label="일정" icon={ri("calendar")} />
        <RNBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={ri("users")} />
        <RNBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={ri(withBack ? "chat" : "user")} />
      </RNBottomNavigation>
    </div>
  );
}

const webContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<><Code>variant</Code> 기본값은 <Code>"bar"</Code>로, 화면 폭을 꽉 채우고 상단 보더가 있는 형태입니다. <Code>value</Code>/<Code>onChange</Code>로 제어하고, <Code>icon</Code>은 <Code>(active) =&gt; ReactNode</Code> 렌더 함수입니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? brand : secondary} />} />
  …
</BottomNavigation>`}
    >
      <WebDemo />
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>은 radius-full pill에 보더 + 은은한 그림자를 더해 화면 위에 띄웁니다.</>}
      code={`<BottomNavigation variant="floating" value={value} onChange={setValue}>…</BottomNavigation>`}
    >
      <WebDemo variant="floating" />
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>을 주면 좌측에 뒤로가기 버튼이 생깁니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <WebDemo withBack />
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<>RN도 동일 API. <Code>icon</Code>의 색은 <Code>useTheme()</Code>로 가져옵니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? t.color.brand.primary : t.color.text.secondary} />} />
  …
</BottomNavigation>`}
    >
      <ClientOnly><RNDemo /></ClientOnly>
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>으로 pill 형태로 띄웁니다.</>}
      code={`<BottomNavigation variant="floating" value={value} onChange={setValue}>…</BottomNavigation>`}
    >
      <ClientOnly><RNDemo variant="floating" /></ClientOnly>
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>으로 뒤로가기 버튼을 표시합니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <ClientOnly><RNDemo withBack /></ClientOnly>
    </Example>
  </>
);

export default function BottomNavigationPage() {
  return (
    <ComponentDoc title="BottomNavigation" lead="화면 하단의 네비게이션 바. bar(기본)·floating 두 룩과 뒤로가기 중첩형을 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 7: Run the docs build + tests**

Run: `pnpm --filter @superbase/docs test`
Expected: PASS.

Run: `pnpm --filter @superbase/docs build`
Expected: build succeeds (Header + bottom-navigation pages compile, no type errors).

- [ ] **Step 8: Visually verify both pages**

Start the docs dev server in the background and capture the Header and BottomNavigation pages via headless Chrome (CDP), following the same procedure used for prior components. Confirm:
- Header: bar (full-width, bottom border), floating (rounded card + subtle shadow), back-arrow variant, red badge dot on the bell.
- BottomNavigation: bar (full-width, top border) is now the default; floating (pill + subtle shadow) under the floating example.

If anything looks off (badge position, dot size, title truncation), tune the CSS/RN inline styles and re-verify before committing.

- [ ] **Step 9: Commit**

```bash
git add apps/docs/app/components/header apps/docs/app/components/bottom-navigation apps/docs/components/docs/componentNav.ts apps/docs/components/docs/componentNav.test.ts
git commit -m "docs: Header page + BottomNavigation variant demos + nav entry"
```

---

## Task 7: Changeset + full verification

**Files:**
- Create: `.changeset/header-and-bar-variants.md`

- [ ] **Step 1: Write the changeset**

Create `.changeset/header-and-bar-variants.md`:

```md
---
"@superbase/icons": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

Header 컴포넌트 추가 및 bar/floating variant 통일

- `Header` compound 컴포넌트 신규 (Web + React Native): `Header` / `HeaderBrand` / `HeaderTitle` / `HeaderActions` / `HeaderAction`. `onBack` 뒤로가기 버튼, `HeaderAction`의 `badge`로 빨간 알림 점 지원.
- `bell` 아이콘 추가.
- `Header`·`BottomNavigation`에 `variant="bar" | "floating"` 도입(기본값 `"bar"`). floating은 라운드 + 보더 + `shadow-sm`(은은한 그림자)로 통일.
- ⚠️ BottomNavigation 기본 룩 변경: 기존 floating pill → `bar`(꽉 찬 바)가 기본. 기존 룩이 필요하면 `variant="floating"`을 명시하세요.
```

- [ ] **Step 2: Run the full test suite**

Run: `pnpm test`
Expected: all packages PASS (icons 24 icons; react Header + BottomNavigation; react-native Header + BottomNavigation; docs componentNav 17).

- [ ] **Step 3: Run full typecheck**

Run: `pnpm -r typecheck`
Expected: no errors across all packages.

- [ ] **Step 4: Build everything**

Run: `pnpm -r build`
Expected: all packages + docs build successfully.

- [ ] **Step 5: Commit**

```bash
git add .changeset/header-and-bar-variants.md
git commit -m "chore: changeset for Header + bar/floating variants"
```

---

## Final Review

After all tasks, dispatch a holistic review of the full diff (`git diff main...HEAD`) checking:
- Header parts mirror Web/RN behavior (props, defaults, a11y) and the variant style branch matches between platforms.
- No `--spacing-5`/`t.spacing["5"]` usage anywhere.
- BottomNavigation floating no longer uses `shadow-lg`; both components' floating uses `shadow-sm` + border.
- Exports complete in both `index.ts` files; types exported.
- Spec coverage: bell icon, Header (5 parts + back + badge + variant) on both platforms, BottomNavigation variant on both platforms, docs (Header page, BottomNav demos, nav entry), changeset.

Then use superpowers:finishing-a-development-branch.
```
