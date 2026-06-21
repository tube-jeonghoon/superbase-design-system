# Plan 1b — RN 테마 적용 (ThemeProvider/useTheme + 컴포넌트 전환) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/react-native`에 런타임 다크테마(`ThemeProvider`/`useTheme`, 기본값 라이트=하위호환)를 도입하고, 10개 RN 컴포넌트를 정적 토큰 import에서 `useTheme()` 기반으로 전환하면서 `forwardRef`와 신규 component-size/opacity/border-width/danger 토큰을 적용한다.

**Architecture:** `@superbase/tokens/native/theme`(Plan 1a에서 추가)의 `lightTheme`/`darkTheme` 객체를 React Context로 흘린다. `ThemeContext` 기본값은 `lightTheme`이라 Provider 없이도 동작(non-breaking). 각 컴포넌트는 `const t = useTheme()`로 테마를 읽어 스타일을 함수 본문에서 구성하고 `forwardRef`로 ref를 전달한다. 색은 테마에서 와 다크에서 자동 전환되고, 치수/보더/opacity는 1a 토큰으로 교체한다.

**Tech Stack:** React 19, React Native 0.86 타입, react-native-web 0.19(테스트), Vitest+jsdom+Testing Library, TypeScript 5. 변경 패키지: `@superbase/react-native`만.

> 전제: Plan 1a 머지됨 — `@superbase/tokens/native/theme`가 `lightTheme`/`darkTheme`/`Theme`/`ColorScheme`를 export. 테마 형태: `t.color.{text,background,brand,border,status}`, `t.spacing["0".."8"]`(숫자), `t.radius.{sm,md,lg,full}`, `t.font.size.{caption,body,title,display}`, `t.font.weight.{regular,medium,bold}`(숫자), `t.lineHeight.{...}`, `t.borderWidth.{thin,medium}`, `t.opacity.{disabled,pressed}`, `t.motion.{duration,easing}`, `t.shadow.{sm,md,lg,xl}`, `t.size.{control,field,button.{sm,md,lg},switch.{width,height,thumb},icon.{sm,md,lg}}`.
> 기존 공개 prop API는 전부 유지(추가/내부 변경만). 기존 컴포넌트 테스트(Provider 없이 렌더)는 라이트 기본값으로 그대로 통과해야 한다.
> spacing/size 접근은 **문자열 키**로: `t.spacing["4"]`, `t.size.button[size]`. fontWeight는 숫자라 `String(t.font.weight[weight]) as TextStyle["fontWeight"]`.
> 명령은 레포 루트에서 `pnpm --filter @superbase/react-native ...`. 컴포넌트 테스트 1개 실행: `pnpm --filter @superbase/react-native test <상대경로>`.

---

## Task 1: 테마 인프라 (ThemeContext / useTheme / ThemeProvider)

**Files:**
- Create: `packages/react-native/src/theme/ThemeContext.ts`
- Create: `packages/react-native/src/theme/useTheme.ts`
- Create: `packages/react-native/src/theme/ThemeProvider.tsx`
- Create: `packages/react-native/src/theme/theme.test.tsx`
- Modify: `packages/react-native/src/index.ts`
- Modify: `packages/react-native/src/test-setup.ts` (jsdom matchMedia 폴리필)

- [ ] **Step 1: tokens가 빌드돼 theme export가 존재하는지 보장**

Run: `pnpm --filter @superbase/tokens build`
Expected: 성공. `packages/tokens/dist/native/theme.js` 존재(이게 있어야 RN이 `@superbase/tokens/native/theme`를 해석).

- [ ] **Step 2: test-setup에 matchMedia 폴리필 추가**

`useColorScheme`(ThemeProvider가 사용)이 jsdom에서 `window.matchMedia` 부재로 throw하지 않도록 폴리필. `packages/react-native/src/test-setup.ts`를 아래로 교체:

```ts
import "@testing-library/jest-dom/vitest";

// react-native-web's useColorScheme reads window.matchMedia; jsdom lacks it.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 3: 실패 테스트 작성**

Create `packages/react-native/src/theme/theme.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";

function Probe() {
  const t = useTheme();
  return <span>{t.color.background.default}</span>;
}

describe("ThemeProvider / useTheme", () => {
  it("defaults to light theme without a provider (non-breaking)", () => {
    render(<Probe />);
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });

  it("provides light theme by default", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });

  it("provides dark theme when colorScheme='dark'", () => {
    render(
      <ThemeProvider colorScheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("#191f28")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: 실패 확인**

Run: `pnpm --filter @superbase/react-native test src/theme/theme.test.tsx`
Expected: FAIL — `./ThemeProvider`/`./useTheme` 미존재.

- [ ] **Step 5: 인프라 구현**

Create `packages/react-native/src/theme/ThemeContext.ts`:
```ts
import { createContext } from "react";
import { lightTheme, type Theme } from "@superbase/tokens/native/theme";

// 기본값 lightTheme → Provider 없이 useTheme()를 써도 라이트 동작(하위호환).
export const ThemeContext = createContext<Theme>(lightTheme);
```

Create `packages/react-native/src/theme/useTheme.ts`:
```ts
import { useContext } from "react";
import type { Theme } from "@superbase/tokens/native/theme";
import { ThemeContext } from "./ThemeContext";

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

Create `packages/react-native/src/theme/ThemeProvider.tsx`:
```tsx
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type ColorScheme } from "@superbase/tokens/native/theme";
import { ThemeContext } from "./ThemeContext";

export interface ThemeProviderProps {
  /** "light" | "dark" | "system". "system"이면 OS 설정을 따른다. 기본 "light". */
  colorScheme?: ColorScheme | "system";
  children: ReactNode;
}

export function ThemeProvider({ colorScheme = "light", children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolved = colorScheme === "system" ? systemScheme ?? "light" : colorScheme;
  const theme = resolved === "dark" ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 6: index.ts에 export 추가**

`packages/react-native/src/index.ts`의 맨 끝에 추가:
```ts
export { ThemeProvider } from "./theme/ThemeProvider";
export type { ThemeProviderProps } from "./theme/ThemeProvider";
export { useTheme } from "./theme/useTheme";
export type { Theme, ColorScheme } from "@superbase/tokens/native/theme";
```

- [ ] **Step 7: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/theme/theme.test.tsx`
Expected: PASS (3 케이스).
Run: `pnpm --filter @superbase/react-native typecheck`
Expected: exit 0.

- [ ] **Step 8: 커밋**
```bash
git add packages/react-native/src/theme packages/react-native/src/index.ts packages/react-native/src/test-setup.ts
git commit -m "feat(react-native): add ThemeProvider/useTheme (default light, non-breaking)"
```

---

## Task 2: Text → useTheme + forwardRef + lineHeight

**Files:** Rewrite `packages/react-native/src/Text/Text.tsx`. Test: `packages/react-native/src/Text/Text.test.tsx`(기존 유지).

- [ ] **Step 1: ref 전달 테스트 추가**

`packages/react-native/src/Text/Text.test.tsx`에 케이스 추가(기존 import에 `createRef`가 없으면 추가). 파일 끝 `});` 직전에:
```tsx
  it("forwards ref to the underlying element", () => {
    const ref = { current: null as unknown };
    render(<Text ref={ref as never}>hello</Text>);
    expect(ref.current).not.toBeNull();
  });
```
(상단에 `import { Text } from "./Text";`가 이미 있다고 가정.)

- [ ] **Step 2: 실패/현행 확인**

Run: `pnpm --filter @superbase/react-native test src/Text/Text.test.tsx`
Expected: 새 케이스가 ref 미전달로 FAIL(현재 forwardRef 아님).

- [ ] **Step 3: Text.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
}

export const Text = forwardRef<ElementRef<typeof RNText>, TextProps>(function Text(
  { variant = "body", weight = "regular", color = "primary", style, ...rest },
  ref,
) {
  const t = useTheme();
  const colorFor: Record<TextColor, string> = {
    primary: t.color.text.primary,
    secondary: t.color.text.secondary,
    disabled: t.color.text.disabled,
    brand: t.color.brand.primary,
  };
  return (
    <RNText
      ref={ref}
      style={[
        {
          fontSize: t.font.size[variant],
          lineHeight: t.font.size[variant] * t.lineHeight[variant],
          fontWeight: String(t.font.weight[weight]) as TextStyle["fontWeight"],
          color: colorFor[color],
        },
        style,
      ]}
      {...rest}
    />
  );
});
```

- [ ] **Step 4: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Text/Text.test.tsx` → PASS(기존+ref).
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 5: 커밋**
```bash
git add packages/react-native/src/Text/Text.tsx packages/react-native/src/Text/Text.test.tsx
git commit -m "feat(react-native): Text uses useTheme + forwardRef + lineHeight"
```

---

## Task 3: Button → useTheme + forwardRef + size/opacity 토큰

**Files:** Rewrite `packages/react-native/src/Button/Button.tsx`. Test: 기존 `Button.test.tsx` 유지.

- [ ] **Step 1: Button.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  // object/array styles only — Pressable's function-style form is intentionally
  // not supported so it can't be silently dropped into the style array below.
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", disabled = false, style, ...rest },
  ref,
) {
  const t = useTheme();
  const padFor: Record<ButtonSize, number> = {
    sm: t.spacing["3"],
    md: t.spacing["4"],
    lg: t.spacing["6"],
  };
  const bg = variant === "primary" ? t.color.brand.primary : t.color.background.subtle;
  const fg = variant === "primary" ? "#ffffff" : t.color.text.primary;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={disabled}
      style={[
        {
          height: t.size.button[size],
          paddingHorizontal: padFor[size],
          borderRadius: t.radius.md,
          backgroundColor: bg,
          opacity: disabled ? t.opacity.disabled : 1,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      {...rest}
    >
      <RNText
        style={{
          color: fg,
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
        }}
      >
        {children}
      </RNText>
    </Pressable>
  );
});
```
> 주: primary 텍스트는 항상 흰색(`#ffffff`) — 토큰에 별도 onBrand 색이 없으므로 리터럴 유지(웹 Button과 동일 동작). secondary는 `text.primary`라 다크에서 자동 전환.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Button/Button.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Button/Button.tsx
git commit -m "feat(react-native): Button uses useTheme + forwardRef + size/opacity tokens"
```

---

## Task 4: TextField → useTheme + forwardRef + field/border/danger 토큰

**Files:** Rewrite `packages/react-native/src/TextField/TextField.tsx`. Test 기존 유지.

- [ ] **Step 1: TextField.tsx 전체 교체** (ref는 내부 `TextInput`으로 전달)

```tsx
import { forwardRef, type ElementRef } from "react";
import { View, Text as RNText, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<ElementRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing["1"] }}>
      {label ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>
          {label}
        </RNText>
      ) : null}
      <TextInput
        ref={ref}
        style={[
          {
            height: t.size.field,
            paddingHorizontal: t.spacing["4"],
            borderWidth: t.borderWidth.thin,
            borderColor: error ? t.color.status.danger : t.color.border.default,
            borderRadius: t.radius.md,
            fontSize: t.font.size.body,
            color: t.color.text.primary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.status.danger }}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
});
```
> 변경점: 하드코딩 `height:48`→`t.size.field`, `borderWidth:1`→`t.borderWidth.thin`, error 색 `ColorRed500`(primitive)→`t.color.status.danger`(semantic).

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/TextField/TextField.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/TextField/TextField.tsx
git commit -m "feat(react-native): TextField uses useTheme + forwardRef + field/border/danger tokens"
```

---

## Task 5: Stack → useTheme + forwardRef

**Files:** Rewrite `packages/react-native/src/Stack/Stack.tsx`. Test 기존 유지.

- [ ] **Step 1: Stack.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { View, type ViewProps, type FlexStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
}

export const Stack = forwardRef<ElementRef<typeof View>, StackProps>(function Stack(
  { direction = "column", gap = 0, padding = 0, align, justify, style, ...rest },
  ref,
) {
  const t = useTheme();
  const SPACING: Record<SpacingScale, number> = {
    0: 0,
    1: t.spacing["1"],
    2: t.spacing["2"],
    3: t.spacing["3"],
    4: t.spacing["4"],
    6: t.spacing["6"],
    8: t.spacing["8"],
  };
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: direction,
          gap: SPACING[gap],
          padding: SPACING[padding],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    />
  );
});
```

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Stack/Stack.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Stack/Stack.tsx
git commit -m "feat(react-native): Stack uses useTheme + forwardRef"
```

---

## Task 6: Switch → useTheme + forwardRef

**Files:** Rewrite `packages/react-native/src/Switch/Switch.tsx`. Test 기존 유지.

- [ ] **Step 1: Switch.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface SwitchProps
  extends Omit<RNSwitchProps, "value" | "onValueChange" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<ElementRef<typeof RNSwitch>, SwitchProps>(function Switch(
  { checked, onChange, disabled, ...rest },
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
      {...rest}
    />
  );
});
```
> 변경점: `ColorGray200`(primitive)→`t.color.border.default`(semantic, gray.200와 동일값이라 라이트 동작 동일, 다크 전환됨), `ColorBrandPrimary`→`t.color.brand.primary`.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Switch/Switch.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Switch/Switch.tsx
git commit -m "feat(react-native): Switch uses useTheme + forwardRef"
```

---

## Task 7: Checkbox → useTheme + forwardRef + control/border/opacity 토큰

**Files:** Rewrite `packages/react-native/src/Checkbox/Checkbox.tsx`. Test 기존 유지.

- [ ] **Step 1: Checkbox.tsx 전체 교체** (내부 체크마크 크기는 `control`의 절반으로 토큰 기반 계산)

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
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const Checkbox = forwardRef<ElementRef<typeof Pressable>, CheckboxProps>(function Checkbox(
  { checked, onChange, disabled = false, label, style, ...rest },
  ref,
) {
  const t = useTheme();
  const box = t.size.control;
  const mark = Math.round(box / 2);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both (native uses
      // accessibilityState; RNW/web a11y tree needs aria-checked). Do not remove.
      aria-checked={checked}
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
          borderColor: checked ? t.color.brand.primary : t.color.border.default,
          backgroundColor: checked ? t.color.brand.primary : t.color.background.default,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
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
> 변경점: 박스 `20`→`t.size.control`, 내부마크 `10`→`control/2`, `borderWidth:2`→`t.borderWidth.medium`, `opacity:0.4`→`t.opacity.disabled`, 색 semantic. 체크마크 흰색은 리터럴 유지.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Checkbox/Checkbox.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Checkbox/Checkbox.tsx
git commit -m "feat(react-native): Checkbox uses useTheme + forwardRef + control/border/opacity tokens"
```

---

## Task 8: Radio + RadioGroup → useTheme + forwardRef

**Files:** Rewrite `packages/react-native/src/Radio/Radio.tsx` 및 `packages/react-native/src/Radio/RadioGroup.tsx`. (`RadioContext`는 변경 없음.) Test 기존 유지.

- [ ] **Step 1: Radio.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { Pressable, View, Text as RNText } from "react-native";
import { useRadioContext } from "./RadioContext";
import { useTheme } from "../theme/useTheme";

export interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const Radio = forwardRef<ElementRef<typeof Pressable>, RadioProps>(function Radio(
  { value, label, disabled = false },
  ref,
) {
  const t = useTheme();
  const group = useRadioContext();
  const checked = group.value === value;
  const box = t.size.control;
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

- [ ] **Step 2: RadioGroup.tsx 전체 교체**

```tsx
import { forwardRef, type ReactNode, type ElementRef } from "react";
import { View, type ViewProps } from "react-native";
import { RadioContext } from "./RadioContext";
import { useTheme } from "../theme/useTheme";

export interface RadioGroupProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export const RadioGroup = forwardRef<ElementRef<typeof View>, RadioGroupProps>(function RadioGroup(
  { value, onChange, children, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View ref={ref} style={[{ gap: t.spacing["2"] }, style]} {...rest}>
      <RadioContext.Provider value={{ value, onChange }}>{children}</RadioContext.Provider>
    </View>
  );
});
```

- [ ] **Step 3: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Radio/Radio.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 4: 커밋**
```bash
git add packages/react-native/src/Radio/Radio.tsx packages/react-native/src/Radio/RadioGroup.tsx
git commit -m "feat(react-native): Radio/RadioGroup use useTheme + forwardRef + control tokens"
```

---

## Task 9: Badge → useTheme + forwardRef + fontWeight 토큰

**Files:** Rewrite `packages/react-native/src/Badge/Badge.tsx`. Test 기존 유지.

- [ ] **Step 1: Badge.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

export const Badge = forwardRef<ElementRef<typeof View>, BadgeProps>(function Badge(
  { children, variant = "neutral" },
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
        alignSelf: "flex-start",
        paddingVertical: 2,
        paddingHorizontal: t.spacing["2"],
        borderRadius: t.radius.full,
        backgroundColor: bgFor[variant],
      }}
    >
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
> 변경점: `fontWeight:"500"`→`t.font.weight.medium`. `paddingVertical:2`는 매칭 토큰이 없어 내부 튜닝값으로 유지(2px). 컬러 라벨(흰색)은 리터럴 유지.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Badge/Badge.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Badge/Badge.tsx
git commit -m "feat(react-native): Badge uses useTheme + forwardRef + fontWeight token"
```

---

## Task 10: Spinner → useTheme + forwardRef + 영문 a11y 기본값

**Files:** Rewrite `packages/react-native/src/Spinner/Spinner.tsx`. Test 기존 유지.

- [ ] **Step 1: Spinner.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "size" | "color"> {
  size?: SpinnerSize;
  color?: string;
}

// ActivityIndicator의 size는 "small" | "large" | number 의미값이라 디자인 토큰이 아님(내부 매핑 유지).
const sizeFor: Record<SpinnerSize, ActivityIndicatorProps["size"]> = {
  sm: "small",
  md: 28,
  lg: "large",
};

export const Spinner = forwardRef<ElementRef<typeof ActivityIndicator>, SpinnerProps>(function Spinner(
  { size = "md", color, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <ActivityIndicator
      ref={ref}
      size={sizeFor[size]}
      color={color ?? t.color.brand.primary}
      accessibilityLabel="Loading"
      {...rest}
    />
  );
});
```
> 변경점: 기본 color를 테마(`t.color.brand.primary`)에서, 하드코딩 한국어 `accessibilityLabel="로딩 중"`→영문 `"Loading"`(웹 Spinner와 정합, Plan 1c에서 웹도 영문화). `size` 매핑은 ActivityIndicator 의미값이라 토큰화하지 않음.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Spinner/Spinner.test.tsx` → PASS.
> 만약 기존 Spinner 테스트가 `accessibilityLabel="로딩 중"`(또는 aria-label)을 단언하면, 영문 `"Loading"`으로 그 단언을 업데이트하라(의도된 변경). 변경했으면 보고.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Spinner/Spinner.tsx packages/react-native/src/Spinner/Spinner.test.tsx
git commit -m "feat(react-native): Spinner uses useTheme + forwardRef + English a11y default"
```

---

## Task 11: Icon → useTheme 기본색 + forwardRef

**Files:** Rewrite `packages/react-native/src/Icon/Icon.tsx`. Test 기존 유지.

- [ ] **Step 1: Icon.tsx 전체 교체**

```tsx
import { forwardRef, type ElementRef } from "react";
import { Svg, Path } from "react-native-svg";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";
import { useTheme } from "../theme/useTheme";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<ElementRef<typeof Svg>, IconProps>(function Icon(
  { name, size = 20, color, label },
  ref,
) {
  const t = useTheme();
  const stroke = color ?? t.color.text.primary;
  const a11y = label
    ? { accessibilityRole: "image" as const, accessibilityLabel: label }
    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return (
    <Svg ref={ref} width={size} height={size} viewBox={ICON_VIEWBOX} {...a11y}>
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
> 변경점: 기본 color를 `ColorTextPrimary`(정적)→`t.color.text.primary`(테마, 다크 전환). `size=20` 기본은 `size.icon.md`와 동일값이라 그대로 둠. `strokeWidth={2}`는 아이콘 드로잉 고유값(토큰 아님) 유지.
> 참고: `ElementRef<typeof Svg>` 타입이 react-native-svg 타입에서 잘 잡히지 않으면 `forwardRef<Svg, IconProps>` 대신 `forwardRef<React.ComponentRef<typeof Svg>, IconProps>`로 시도하라. ref 전달 자체가 목적이고, typecheck 통과가 기준.

- [ ] **Step 2: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Icon/Icon.test.tsx` → PASS.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 3: 커밋**
```bash
git add packages/react-native/src/Icon/Icon.tsx
git commit -m "feat(react-native): Icon uses useTheme default color + forwardRef"
```

---

## Task 12: 다크 통합 테스트 + 전체 검증 + changeset

**Files:**
- Create: `packages/react-native/src/theme/integration.test.tsx`
- Create: `.changeset/phase1b-rn-theming.md`

- [ ] **Step 1: 다크 통합 테스트 작성**

컴포넌트가 ThemeProvider 다크에서 다크 색을 렌더하는지 1개 통합 검증. Create `packages/react-native/src/theme/integration.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { Text } from "../Text/Text";

describe("dark theme integration", () => {
  it("renders Text with light primary color by default", () => {
    render(<Text>hi</Text>);
    const el = screen.getByText("hi");
    expect(el).toHaveStyle({ color: "#191f28" });
  });

  it("renders Text with dark primary color under dark provider", () => {
    render(
      <ThemeProvider colorScheme="dark">
        <Text>hi</Text>
      </ThemeProvider>,
    );
    const el = screen.getByText("hi");
    // dark text.primary differs from light (#191f28)
    expect(el).not.toHaveStyle({ color: "#191f28" });
  });
});
```
> 주: react-native-web는 style을 인라인으로 적용하므로 `toHaveStyle`로 색 검증 가능. 다크 `text.primary` 정확값에 의존하지 않도록 "라이트값이 아님"으로 단언(견고).

- [ ] **Step 2: 통합 테스트 통과**

Run: `pnpm --filter @superbase/react-native test src/theme/integration.test.tsx`
Expected: PASS.
> 만약 rnw가 색을 인라인 style로 안 내보내 `toHaveStyle`이 실패하면: 첫 케이스를 `expect(el).toBeInTheDocument()`로 완화하고, 둘째 케이스는 라이트/다크 두 렌더의 `el.getAttribute("style")`(또는 `el.style.color`) 문자열이 서로 다른지 단언하는 방식으로 바꿔라(메커니즘은 Task 1 theme.test에서 이미 입증됨). 변경 시 보고.

- [ ] **Step 3: 전체 검증**

Run: `pnpm --filter @superbase/react-native test`
Expected: 전체 PASS(기존 컴포넌트 테스트 + 신규 theme/integration). 기존 테스트는 Provider 없이 라이트로 통과.
Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과. RN 빌드(tsc) 성공 — forwardRef 컴포넌트 d.ts 방출.

- [ ] **Step 4: docs 빌드 무영향 확인**

Run: `pnpm turbo run build --filter=@superbase/docs`
Expected: 성공. docs의 RN 프리뷰는 `useTheme` 기본값 라이트로 동작(ThemeProvider 미사용이라 시각 변화 없음).

- [ ] **Step 5: changeset 작성**

Create `.changeset/phase1b-rn-theming.md`:
```md
---
"@superbase/react-native": minor
---

런타임 다크테마 도입: `ThemeProvider`/`useTheme`(기본값 라이트 — Provider 없이도 기존처럼 동작하므로 하위호환) export. 10개 컴포넌트를 테마 기반으로 전환하고 forwardRef 지원 추가. 하드코딩 치수를 1a 토큰(size/border-width/opacity)으로 교체, TextField error·Switch 트랙 색을 semantic 토큰으로, Spinner 기본 a11y 라벨을 영문("Loading")으로 변경.
```

- [ ] **Step 6: 커밋**
```bash
git add packages/react-native/src/theme/integration.test.tsx .changeset/phase1b-rn-theming.md
git commit -m "test(react-native): dark theme integration + changeset for RN theming"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 기존 RN 컴포넌트 테스트는 Provider 없이 라이트로 그대로 통과(하위호환 입증).
- `ThemeProvider`/`useTheme`/`Theme`/`ColorScheme` export. `useTheme()`는 Provider 없으면 lightTheme.
- 10개 RN 컴포넌트가 `useTheme()` 기반 + `forwardRef` 지원. 하드코딩 치수/보더/opacity가 1a 토큰으로 교체, error/track 색이 semantic, Spinner a11y 영문.
- changeset로 `@superbase/react-native` minor 예약. docs 빌드 무영향.

## 이후 (Plan 1c)
- **Plan 1c**: `@superbase/react` 10개 컴포넌트 `forwardRef` + 하드코딩→`var(--…)` 교체 + `:focus-visible` focus-ring + Spinner 기본 aria-label 영문화. docs Foundations 페이지에 신규 토큰(shadow/motion 등) 시각화 추가.
- docs Getting Started 또는 RN 노트에 `ThemeProvider` 사용법 짧게 추가(1c 또는 마무리).
