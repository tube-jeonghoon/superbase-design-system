# Plan 2c — 작은 컴포넌트 + Icon 스케일 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Checkbox `indeterminate`, Badge `size`/`icon`/`dot`, Switch·Radio `size`(sm/md), Icon 명명 크기(`xs|sm|md|lg`)를 웹·RN에 추가한다(전부 추가만, non-breaking). 필요한 토큰(`icon-xs`, `control-sm`, `switch-sm-*`)을 추가한다.

**Architecture:** Phase 1 토큰/forwardRef/테마 위에서 작은 변형을 더한다. 새 치수는 토큰으로. Checkbox indeterminate는 `aria-checked="mixed"` + 대시 마크. Badge는 size data-attr + 선택적 leading icon/dot. Switch sm은 웹=토큰 치수, RN=네이티브 스위치 `transform: scale(0.8)`. Radio sm=control-sm 토큰. Icon 명명 크기는 웹=내장 px 맵(토큰 CSS 의존 없이 견고), RN=`t.size.icon[name]`.

**Tech Stack:** React 19, Vite(웹), tsc(RN), Style Dictionary(토큰), CSS Modules + 토큰, Vitest + jsdom + Testing Library, Next.js(docs). 변경: `@superbase/tokens`, `@superbase/react`, `@superbase/react-native`, `apps/docs`.

> 전제: Phase 1·2a·2b 완료. RN 테스트는 공용 `src/test-setup.tsx`에서 `react-native-svg`를 mock(2b에서 추가) → Icon 포함 트리 렌더 가능. 토큰 빌드는 `TOKENS_DIST` env로 출력 분기(테스트=temp). docs는 패키지 dist의 .d.ts를 소비 → 컴포넌트 변경 후 `pnpm --filter <pkg> build` 필요.
> 명령: `pnpm --filter @superbase/tokens test`, `pnpm --filter @superbase/react test <path>`, `pnpm --filter @superbase/react-native test <path>`, 각 `typecheck`.

---

## Task 1: 토큰 — icon-xs / control-sm / switch-sm

**Files:** Modify `packages/tokens/src/sizing.json`, `packages/tokens/build.mjs`(themeDts), `packages/tokens/test/build.test.ts`, `packages/tokens/test/theme.test.ts`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/tokens/test/build.test.ts`의 snapshot 케이스들 앞에 추가(파일 내 기존 어서션이 쓰는 temp `dist` 변수를 사용 — `pkgRoot`가 아니라 그 변수로 경로를 만들 것):
```ts
  it("emits 2c size tokens (icon-xs, control-sm, switch-sm)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-icon-xs: 12px;");
    expect(css).toContain("--size-control-sm: 16px;");
    expect(css).toContain("--size-switch-sm-width: 40px;");
    expect(css).toContain("--size-switch-sm-height: 24px;");
    expect(css).toContain("--size-switch-sm-thumb: 20px;");
  });
```
> 위 스니펫은 `dist`라는 로컬 temp 디렉터리 변수를 가정한다. 파일의 기존 어서션이 실제로 어떤 변수로 출력 경로를 만드는지 확인하고 동일 변수를 쓸 것.

`packages/tokens/test/theme.test.ts`에서 `expect(lightTheme.size.fieldLg).toBe(56);` 줄 **뒤**에 추가:
```ts
    expect(lightTheme.size.controlSm).toBe(16);
    expect(lightTheme.size.icon.xs).toBe(12);
    expect(lightTheme.size.switchSm.width).toBe(40);
    expect(lightTheme.size.switchSm.thumb).toBe(20);
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/tokens test` → 새 어서션 FAIL.

- [ ] **Step 3: sizing.json에 토큰 추가**

`packages/tokens/src/sizing.json`을 아래로 교체(기존 + 신규 `controlSm`, `switchSm`, `icon.xs`):
```json
{
  "size": {
    "control": { "value": "20px" },
    "controlSm": { "value": "16px" },
    "field":   { "value": "48px" },
    "fieldSm": { "value": "40px" },
    "fieldLg": { "value": "56px" },
    "button": {
      "sm": { "value": "36px" },
      "md": { "value": "44px" },
      "lg": { "value": "52px" }
    },
    "switch": {
      "width":  { "value": "52px" },
      "height": { "value": "32px" },
      "thumb":  { "value": "28px" }
    },
    "switchSm": {
      "width":  { "value": "40px" },
      "height": { "value": "24px" },
      "thumb":  { "value": "20px" }
    },
    "icon": {
      "xs": { "value": "12px" },
      "sm": { "value": "16px" },
      "md": { "value": "20px" },
      "lg": { "value": "24px" }
    }
  }
}
```

- [ ] **Step 4: build.mjs themeDts 타입 추가**

`packages/tokens/build.mjs`의 `themeDts()` 안 `size:` 인터페이스를 아래로 만든다(`controlSm`, `switchSm`, `icon.xs` 추가):
```js
  size: {
    control: number;
    controlSm: number;
    field: number;
    fieldSm: number;
    fieldLg: number;
    button: { sm: number; md: number; lg: number };
    switch: { width: number; height: number; thumb: number };
    switchSm: { width: number; height: number; thumb: number };
    icon: { xs: number; sm: number; md: number; lg: number };
  };
```

- [ ] **Step 5: 통과 + 실제 dist 재빌드**

Run: `pnpm --filter @superbase/tokens test` → PASS. 스냅샷 변경 시 `pnpm exec vitest run -u`(패키지 디렉터리 안에서).
Run: `pnpm --filter @superbase/tokens build` → 실제 dist 갱신(다운스트림용). 확인: `dist/web/variables.css`에 `--size-icon-xs: 12px;`, `dist/native/theme.d.ts`에 `controlSm`/`switchSm`.

- [ ] **Step 6: 커밋**
```bash
git add packages/tokens/src/sizing.json packages/tokens/build.mjs packages/tokens/test/build.test.ts packages/tokens/test/theme.test.ts packages/tokens/test/__snapshots__
git commit -m "feat(tokens): add icon-xs, control-sm, switch-sm size tokens"
```

---

## Task 2: Checkbox indeterminate (web + RN)

**Files:** Rewrite `packages/react/src/Checkbox/Checkbox.tsx`, `packages/react/src/Checkbox/Checkbox.module.css`, `packages/react-native/src/Checkbox/Checkbox.tsx`. Tests: 각 `Checkbox.test.tsx`.

- [ ] **Step 1: 웹 실패 테스트 추가**

`packages/react/src/Checkbox/Checkbox.test.tsx`의 describe 끝 직전에 추가(`createRef`/`render`/`screen`는 이미 import):
```tsx
  it("reports aria-checked=mixed when indeterminate", () => {
    render(<Checkbox checked={false} indeterminate aria-label="all" />);
    expect(screen.getByRole("checkbox", { name: "all" })).toHaveAttribute("aria-checked", "mixed");
  });
```

- [ ] **Step 2: 웹 실패 확인** — Run `pnpm --filter @superbase/react test src/Checkbox/Checkbox.test.tsx`.

- [ ] **Step 3: 웹 Checkbox.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, indeterminate = false, onChange, disabled = false, label, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      data-indeterminate={indeterminate ? "true" : undefined}
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

- [ ] **Step 4: 웹 Checkbox.module.css 전체 교체**(기존 + indeterminate 규칙을 checked 규칙 뒤에)
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
.checkbox[data-indeterminate="true"] .box {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}
.checkbox[data-indeterminate="true"] .check {
  background: var(--color-white);
  width: calc(var(--size-control) / 2);
  height: var(--border-width-medium);
  border-radius: 1px;
}
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 5: RN 실패 테스트 추가**

`packages/react-native/src/Checkbox/Checkbox.test.tsx`의 describe 끝 직전에 추가:
```tsx
  it("reports aria-checked=mixed when indeterminate", () => {
    render(<Checkbox checked={false} indeterminate accessibilityLabel="all" />);
    expect(screen.getByRole("checkbox", { name: "all" })).toHaveAttribute("aria-checked", "mixed");
  });
```

- [ ] **Step 6: RN 실패 확인** — Run `pnpm --filter @superbase/react-native test src/Checkbox/Checkbox.test.tsx`.

- [ ] **Step 7: RN Checkbox.tsx 전체 교체**
```tsx
import { forwardRef, type ElementRef } from "react";
import {
  Pressable,
  View,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style" | "onPress"> {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const Checkbox = forwardRef<ElementRef<typeof Pressable>, CheckboxProps>(function Checkbox(
  { checked, indeterminate = false, onChange, disabled = false, label, style, ...rest },
  ref,
) {
  const t = useTheme();
  const box = t.size.control;
  const mark = Math.round(box / 2);
  const filled = checked || indeterminate;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both. Do not remove.
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["2"],
          opacity: disabled ? t.opacity.disabled : 1,
        },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: t.radius.sm,
          borderWidth: t.borderWidth.medium,
          borderColor: filled ? t.color.brand.primary : t.color.border.default,
          backgroundColor: filled ? t.color.brand.primary : t.color.background.default,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <View style={{ width: mark, height: t.borderWidth.medium, borderRadius: 1, backgroundColor: "#ffffff" }} />
        ) : checked ? (
          <View style={{ width: mark, height: mark, borderRadius: 1, backgroundColor: "#ffffff" }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: t.font.size.body, color: t.color.text.primary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
});
```

- [ ] **Step 8: 통과 + 타입체크 + 커밋**

Run: `pnpm --filter @superbase/react test src/Checkbox/Checkbox.test.tsx` → PASS; `pnpm --filter @superbase/react typecheck` → 0.
Run: `pnpm --filter @superbase/react-native test src/Checkbox/Checkbox.test.tsx` → PASS; `pnpm --filter @superbase/react-native typecheck` → 0.
```bash
git add packages/react/src/Checkbox packages/react-native/src/Checkbox/Checkbox.tsx
git commit -m "feat: Checkbox indeterminate state (web + RN)"
```

---

## Task 3: Badge size / icon / dot (web + RN)

**Files:** Rewrite `packages/react/src/Badge/Badge.tsx`, `packages/react/src/Badge/Badge.module.css`, `packages/react-native/src/Badge/Badge.tsx`. Tests: 각 `Badge.test.tsx`.

- [ ] **Step 1: 웹 실패 테스트 추가**

`packages/react/src/Badge/Badge.test.tsx`의 describe 끝 직전에 추가:
```tsx
  it("applies size and renders icon/dot slots", () => {
    const { container } = render(<Badge size="sm" dot icon={<span data-testid="i" />}>X</Badge>);
    expect(container.querySelector('[data-size="sm"]')).not.toBeNull();
    expect(screen.getByTestId("i")).toBeInTheDocument();
  });
```
(`render`/`screen` import 확인 — 없으면 `screen` 추가.)

- [ ] **Step 2: 웹 실패 확인** — Run `pnpm --filter @superbase/react test src/Badge/Badge.test.tsx`.

- [ ] **Step 3: 웹 Badge.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, variant = "neutral", size = "md", icon, dot = false, className },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
});
```

- [ ] **Step 4: 웹 Badge.module.css 전체 교체**
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}
.badge[data-size="sm"] { padding: 1px var(--spacing-1); }
.dot { width: 6px; height: 6px; border-radius: var(--radius-full); background: currentColor; flex-shrink: 0; }
.icon { display: inline-flex; align-items: center; }
.badge[data-variant="neutral"] { background: var(--color-background-subtle); color: var(--color-text-secondary); }
.badge[data-variant="brand"] { background: var(--color-brand-primary); color: var(--color-white); }
.badge[data-variant="success"] { background: var(--color-status-success); color: var(--color-white); }
.badge[data-variant="warning"] { background: var(--color-status-warning); color: var(--color-white); }
.badge[data-variant="danger"] { background: var(--color-status-danger); color: var(--color-white); }
```

- [ ] **Step 5: RN 실패 테스트 추가**

`packages/react-native/src/Badge/Badge.test.tsx`의 describe 끝 직전에 추가:
```tsx
  it("renders an icon slot", () => {
    render(<Badge icon={<span data-testid="i" />}>X</Badge>);
    expect(screen.getByTestId("i")).toBeInTheDocument();
  });
```

- [ ] **Step 6: RN 실패 확인** — Run `pnpm --filter @superbase/react-native test src/Badge/Badge.test.tsx`.

- [ ] **Step 7: RN Badge.tsx 전체 교체**
```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
}

export const Badge = forwardRef<ElementRef<typeof View>, BadgeProps>(function Badge(
  { children, variant = "neutral", size = "md", icon, dot = false },
  ref,
) {
  const t = useTheme();
  const bgFor: Record<BadgeVariant, string> = {
    neutral: t.color.background.subtle,
    brand: t.color.brand.primary,
    success: t.color.status.success,
    warning: t.color.status.warning,
    danger: t.color.status.danger,
  };
  const fgFor: Record<BadgeVariant, string> = {
    neutral: t.color.text.secondary,
    brand: "#ffffff",
    success: "#ffffff",
    warning: "#ffffff",
    danger: "#ffffff",
  };
  return (
    <View
      ref={ref}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing["1"],
        alignSelf: "flex-start",
        paddingVertical: size === "sm" ? 1 : 2,
        paddingHorizontal: size === "sm" ? t.spacing["1"] : t.spacing["2"],
        borderRadius: t.radius.full,
        backgroundColor: bgFor[variant],
      }}
    >
      {dot ? (
        <View style={{ width: 6, height: 6, borderRadius: t.radius.full, backgroundColor: fgFor[variant] }} />
      ) : null}
      {icon}
      <RNText
        style={{
          fontSize: t.font.size.caption,
          fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          color: fgFor[variant],
        }}
      >
        {children}
      </RNText>
    </View>
  );
});
```

- [ ] **Step 8: 통과 + 타입체크 + 커밋**

Run: 웹·RN Badge 테스트 PASS + 각 typecheck 0.
```bash
git add packages/react/src/Badge packages/react-native/src/Badge/Badge.tsx
git commit -m "feat: Badge size/icon/dot (web + RN)"
```

---

## Task 4: Switch · Radio size (web + RN)

**Files:** Rewrite `packages/react/src/Switch/Switch.tsx` + `Switch.module.css`, `packages/react-native/src/Switch/Switch.tsx`, `packages/react/src/Radio/Radio.tsx` + `Radio.module.css`, `packages/react-native/src/Radio/Radio.tsx`. Tests: web `Switch.test.tsx`/`Radio.test.tsx`.

- [ ] **Step 1: 웹 실패 테스트 추가**

`packages/react/src/Switch/Switch.test.tsx` 끝 직전:
```tsx
  it("applies the size data attribute", () => {
    const { container } = render(<Switch checked={false} size="sm" />);
    expect(container.querySelector('[data-size="sm"]')).not.toBeNull();
  });
```
`packages/react/src/Radio/Radio.test.tsx` 끝 직전:
```tsx
  it("applies the size data attribute on a radio", () => {
    const { container } = render(
      <RadioGroup value="a">
        <Radio value="a" label="A" size="sm" />
      </RadioGroup>,
    );
    expect(container.querySelector('[data-size="sm"]')).not.toBeNull();
  });
```
(`RadioGroup`/`render`/`container` 사용 — Radio 테스트에 `RadioGroup` import가 이미 있다(2c 이전 forwardRef 테스트에서 추가됨). 없으면 추가.)

- [ ] **Step 2: 웹 실패 확인** — 두 테스트 실행.

- [ ] **Step 3: 웹 Switch.tsx 전체 교체**
```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Switch.module.css";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, disabled = false, size = "md", className, ...rest },
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
      data-size={size}
      className={[styles.switch, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span className={styles.thumb} />
    </button>
  );
});
```

- [ ] **Step 4: 웹 Switch.module.css 전체 교체**(기존 + sm 규칙)
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
.switch[data-size="sm"] { width: var(--size-switch-sm-width); height: var(--size-switch-sm-height); }
.switch[data-size="sm"] .thumb { width: var(--size-switch-sm-thumb); height: var(--size-switch-sm-thumb); }
.switch[data-size="sm"][data-checked="true"] .thumb {
  transform: translateX(calc(var(--size-switch-sm-width) - var(--size-switch-sm-thumb) - 4px));
}
```

- [ ] **Step 5: 웹 Radio.tsx 전체 교체**
```tsx
import { forwardRef, type ReactNode } from "react";
import { useRadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export type RadioSize = "sm" | "md";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  size?: RadioSize;
  className?: string;
}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { value, label, disabled = false, size = "md", className },
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
      data-size={size}
      className={[styles.radio, className].filter(Boolean).join(" ")}
      onClick={() => group.onChange?.(value)}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
});
```

- [ ] **Step 6: 웹 Radio.module.css 전체 교체**(기존 + sm 규칙)
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
.radio[data-size="sm"] .dot { width: var(--size-control-sm); height: var(--size-control-sm); }
.radio[data-size="sm"][data-checked="true"] .dot::after {
  width: calc(var(--size-control-sm) / 2);
  height: calc(var(--size-control-sm) / 2);
}
.label { font-size: var(--font-size-body); color: var(--color-text-primary); }
```

- [ ] **Step 7: RN Switch.tsx 전체 교체**(sm은 네이티브 스위치 scale)
```tsx
import { forwardRef, type ElementRef } from "react";
import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<RNSwitchProps, "value" | "onValueChange" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
}

export const Switch = forwardRef<ElementRef<typeof RNSwitch>, SwitchProps>(function Switch(
  { checked, onChange, disabled, size = "md", style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <RNSwitch
      ref={ref}
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: t.color.border.default, true: t.color.brand.primary }}
      style={[size === "sm" ? { transform: [{ scale: 0.8 }] } : null, style]}
      {...rest}
    />
  );
});
```
> 네이티브 스위치는 OS 고정 크기라 sm은 `transform: scale(0.8)`로 축소(웹은 토큰 치수). 의도된 플랫폼 관용 차이.

- [ ] **Step 8: RN Radio.tsx 전체 교체**
```tsx
import { forwardRef, type ElementRef } from "react";
import { Pressable, View, Text as RNText } from "react-native";
import { useRadioContext } from "./RadioContext";
import { useTheme } from "../theme/useTheme";

export type RadioSize = "sm" | "md";

export interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
  size?: RadioSize;
}

export const Radio = forwardRef<ElementRef<typeof Pressable>, RadioProps>(function Radio(
  { value, label, disabled = false, size = "md" },
  ref,
) {
  const t = useTheme();
  const group = useRadioContext();
  const checked = group.value === value;
  const box = size === "sm" ? t.size.controlSm : t.size.control;
  const dot = Math.round(box / 2);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both. Do not remove.
      aria-checked={checked}
      disabled={disabled}
      onPress={() => group.onChange?.(value)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing["2"],
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: t.radius.full,
          borderWidth: t.borderWidth.medium,
          borderColor: checked ? t.color.brand.primary : t.color.border.default,
          backgroundColor: t.color.background.default,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View
            style={{ width: dot, height: dot, borderRadius: t.radius.full, backgroundColor: t.color.brand.primary }}
          />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: t.font.size.body, color: t.color.text.primary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
});
```

- [ ] **Step 9: 통과 + 타입체크 + 커밋**

Run: 웹 Switch/Radio 테스트 PASS + `pnpm --filter @superbase/react typecheck` 0.
Run: `pnpm --filter @superbase/react-native test src/Switch src/Radio` PASS + `pnpm --filter @superbase/react-native typecheck` 0.
```bash
git add packages/react/src/Switch packages/react/src/Radio packages/react-native/src/Switch/Switch.tsx packages/react-native/src/Radio/Radio.tsx
git commit -m "feat: Switch/Radio size variants (web + RN)"
```

---

## Task 5: Icon 명명 크기 (web + RN)

**Files:** Rewrite `packages/react/src/Icon/Icon.tsx`, `packages/react-native/src/Icon/Icon.tsx`. Tests: 각 `Icon.test.tsx`.

- [ ] **Step 1: 웹 실패 테스트 추가**

`packages/react/src/Icon/Icon.test.tsx` 끝 직전:
```tsx
  it("resolves named sizes to pixels", () => {
    const { container } = render(<Icon name="check" size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "12");
  });
```

- [ ] **Step 2: 웹 실패 확인** — Run `pnpm --filter @superbase/react test src/Icon/Icon.test.tsx`.

- [ ] **Step 3: 웹 Icon.tsx 전체 교체**(명명 크기는 내장 px 맵 — 토큰 CSS 의존 없이 견고)
```tsx
import { forwardRef, type SVGProps } from "react";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";

export type IconSize = "xs" | "sm" | "md" | "lg";

const ICON_PX: Record<IconSize, number> = { xs: 12, sm: 16, md: 20, lg: 24 };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "color"> {
  name: IconName;
  size?: number | IconSize;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "md", color = "currentColor", label, ...rest },
  ref,
) {
  const px = typeof size === "number" ? size : ICON_PX[size];
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      ref={ref}
      width={px}
      height={px}
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
> 기본 `size="md"`(=20, 기존 기본과 동일값). number는 그대로. 명명 크기 px는 토큰(icon-*)과 동일하지만 컴포넌트가 토큰 CSS 없이도 동작하도록 내장.

- [ ] **Step 4: RN 실패 테스트 추가**

`packages/react-native/src/Icon/Icon.test.tsx` 끝 직전(이 파일은 자체적으로 `react-native-svg`를 mock하거나 공용 setup mock을 사용 — 기존 테스트가 svg width를 어떻게 조회하는지 확인하고 동일 방식 사용):
```tsx
  it("resolves named sizes to pixels", () => {
    const { container } = render(<Icon name="check" size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "12");
  });
```
> 만약 기존 RN Icon 테스트가 `container.querySelector("svg")`로 width를 조회하지 못하면(mock 구현 차이), 기존 테스트가 쓰는 동일 조회 방식으로 맞춰라. 핵심: `size="xs"` → width 12.

- [ ] **Step 5: RN 실패 확인** — Run `pnpm --filter @superbase/react-native test src/Icon/Icon.test.tsx`.

- [ ] **Step 6: RN Icon.tsx 전체 교체**(명명 크기는 `t.size.icon[name]`)
```tsx
import { forwardRef, type ElementRef } from "react";
import { Svg, Path } from "react-native-svg";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";
import { useTheme } from "../theme/useTheme";

export type IconSize = "xs" | "sm" | "md" | "lg";

export interface IconProps {
  name: IconName;
  size?: number | IconSize;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<ElementRef<typeof Svg>, IconProps>(function Icon(
  { name, size = "md", color, label },
  ref,
) {
  const t = useTheme();
  const px = typeof size === "number" ? size : t.size.icon[size];
  const stroke = color ?? t.color.text.primary;
  const a11y = label
    ? { accessibilityRole: "image" as const, accessibilityLabel: label }
    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return (
    <Svg ref={ref} width={px} height={px} viewBox={ICON_VIEWBOX} {...a11y}>
      <Path
        d={iconPaths[name]}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
```
> `t.size.icon`는 Task 1에서 `xs`(12)가 추가됨. number도 그대로. 기본 `"md"`(=20).

- [ ] **Step 7: 통과 + 타입체크 + 커밋**

Run: 웹·RN Icon 테스트 PASS + 각 typecheck 0. (RN typecheck가 `t.size.icon.xs` 미존재로 실패하면 `pnpm --filter @superbase/tokens build` 후 재시도.)
```bash
git add packages/react/src/Icon/Icon.tsx packages/react-native/src/Icon/Icon.tsx
git commit -m "feat: Icon named size scale (xs/sm/md/lg) (web + RN)"
```

---

## Task 6: docs — 5개 컴포넌트 페이지 예시

**Files:** Modify `apps/docs/app/components/{checkbox,badge,switch,radio,icon}/page.tsx`.

각 페이지는 `"use client"`, `<Web…>`/`<RN…>` 컴포넌트 + `ComponentDoc`/`Tabs`/`Example`/`Code`/`ClientOnly`, `webContent`/`nativeContent` 프래그먼트 구조. 각 페이지를 열어 구조 확인 후, 마지막 `<Example>` 뒤(닫는 `</>` 앞)에 해당 예시를 web/native 양쪽에 추가. 인터랙티브 데모는 `useState` 사용(필요 시 기본 export 함수에 상태 추가). 아이콘이 필요한 예시는 `Icon as WebIcon`/`Icon as RNIcon` import 추가.

- [ ] **Step 1: 컴포넌트 패키지 빌드(타입 최신화)**
Run: `pnpm turbo run build --filter=@superbase/react --filter=@superbase/react-native`

- [ ] **Step 2: checkbox 페이지 — indeterminate 예시**

webContent / nativeContent 각각에 추가(웹은 `<WebCheckbox>`, RN은 `<ClientOnly><RNCheckbox>`):
```tsx
    <Example
      title="indeterminate"
      description={<><Code>indeterminate</Code>로 부분 선택(혼합) 상태를 표시합니다.</>}
      code={`<Checkbox indeterminate checked={false} label="전체 선택" />`}
    >
      {/* web: */}
      <WebCheckbox indeterminate checked={false} label="전체 선택" />
    </Example>
```
RN 버전은 동일하되 `<ClientOnly><RNCheckbox indeterminate checked={false} label="전체 선택" /></ClientOnly>`.

- [ ] **Step 3: badge 페이지 — size/icon/dot 예시**
```tsx
    <Example
      title="size · dot · icon"
      description={<><Code>size</Code>(sm/md)·<Code>dot</Code>·<Code>icon</Code>을 지원합니다.</>}
      code={`<Badge size="sm">SM</Badge>\n<Badge dot variant="success">Online</Badge>`}
    >
      <WebBadge size="sm">SM</WebBadge>
      <WebBadge dot variant="success">Online</WebBadge>
      <WebBadge icon={<WebIcon name="star" size="xs" />}>Featured</WebBadge>
    </Example>
```
RN: `<ClientOnly>` 안에 `<RNBadge size="sm">SM</RNBadge>`, `<RNBadge dot variant="success">Online</RNBadge>`, `<RNBadge icon={<RNIcon name="star" size="xs" color="#ffffff" />}>Featured</RNBadge>`. (badge 페이지에 WebIcon/RNIcon import 추가.)

- [ ] **Step 4: switch 페이지 — size 예시**
```tsx
    <Example
      title="size"
      description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
      code={`<Switch size="sm" checked={on} onChange={setOn} />`}
    >
      {/* web: 기존 상태 재사용 또는 간단히 */}
      <WebSwitch size="sm" checked onChange={() => {}} aria-label="sm" />
      <WebSwitch checked onChange={() => {}} aria-label="md" />
    </Example>
```
RN: `<ClientOnly><RNSwitch size="sm" checked onChange={() => {}} accessibilityLabel="sm" /><RNSwitch checked onChange={() => {}} accessibilityLabel="md" /></ClientOnly>`.

- [ ] **Step 5: radio 페이지 — size 예시**
```tsx
    <Example
      title="size"
      description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
      code={`<Radio value="a" label="Small" size="sm" />`}
    >
      <WebRadioGroup value="a" onChange={() => {}} aria-label="size">
        <WebRadio value="a" label="Small" size="sm" />
        <WebRadio value="b" label="Medium" />
      </WebRadioGroup>
    </Example>
```
RN: `<ClientOnly><RNRadioGroup value="a" onChange={() => {}}><RNRadio value="a" label="Small" size="sm" /><RNRadio value="b" label="Medium" /></RNRadioGroup></ClientOnly>`.

- [ ] **Step 6: icon 페이지 — 명명 크기 예시**
```tsx
    <Example
      title="명명 크기"
      description={<><Code>size</Code>에 xs/sm/md/lg를 줄 수 있습니다(숫자도 가능).</>}
      code={`<Icon name="star" size="xs" />\n<Icon name="star" size="lg" />`}
    >
      <WebIcon name="star" size="xs" />
      <WebIcon name="star" size="sm" />
      <WebIcon name="star" size="md" />
      <WebIcon name="star" size="lg" />
    </Example>
```
RN: `<ClientOnly>`에 동일하게 `<RNIcon name="star" size="xs" />` … `size="lg"`. (icon 페이지는 이미 RN/Web Icon import 있음.)

- [ ] **Step 7: 타입체크 + 빌드**

Run: `pnpm --filter @superbase/docs typecheck` → 0.
Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(5개 라우트 빌드).

- [ ] **Step 8: 커밋**
```bash
git add apps/docs/app/components/checkbox apps/docs/app/components/badge apps/docs/app/components/switch apps/docs/app/components/radio apps/docs/app/components/icon
git commit -m "docs: Checkbox indeterminate / Badge size·icon·dot / Switch·Radio size / Icon named sizes examples"
```

---

## Task 7: 전체 검증 + changeset

**Files:** Create `.changeset/phase2c-small-components.md`.

- [ ] **Step 1: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과(tokens + 5컴포넌트 web/RN 신규 + 기존 무회귀 + docs).

- [ ] **Step 2: changeset 작성**

Create `.changeset/phase2c-small-components.md`:
```md
---
"@superbase/tokens": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

작은 컴포넌트 심화 + Icon 스케일: Checkbox `indeterminate`(aria-checked=mixed + 대시), Badge `size`(sm/md)·`icon`·`dot`, Switch·Radio `size`(sm/md), Icon `size`에 명명값(xs/sm/md/lg) 허용(number도 유지). 신규 토큰 `--size-icon-xs`(12)/`--size-control-sm`(16)/`--size-switch-sm-*`(40/24/20). 전부 추가만이라 하위호환.
```

- [ ] **Step 3: 커밋**
```bash
git add .changeset/phase2c-small-components.md
git commit -m "chore: changeset for small components + Icon scale (2c)"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 기존 테스트 무회귀 + 신규.
- Checkbox `indeterminate`(웹·RN, aria-checked=mixed), Badge `size`/`icon`/`dot`, Switch·Radio `size`(sm/md), Icon 명명 크기(xs/sm/md/lg + number) — 웹·RN API 패리티.
- 토큰 `icon-xs`/`control-sm`/`switch-sm-*` 추가(웹 CSS + RN 테마 + 타입).
- docs 5개 페이지에 예시 추가, 빌드 성공.
- changeset로 tokens·react·react-native minor 예약.

## 이후 (Phase 2 완료 후)
- Phase 2(컴포넌트 심화) 3개 플랜(2a·2b·2c) 완료 → 버전 PR 머지 시 일괄 배포.
- **Phase 3**: 새 컴포넌트(Select/Modal/Tooltip/Tabs/Card/Toast 등) — elevation/motion/z-index 토큰 활용. 별도 brainstorming→spec→plan.
