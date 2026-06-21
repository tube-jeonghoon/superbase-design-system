# Plan 2a — Button 심화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 웹·RN Button에 `loading`(내부 Spinner), `startIcon`/`endIcon` 슬롯, `fullWidth`, 그리고 `ghost`·`outline` variant를 추가한다(전부 추가만, non-breaking). 문서 페이지에 예시를 더한다.

**Architecture:** Button이 같은 패키지의 `Spinner`를 내부 소비해 loading 시 렌더한다. 슬롯은 `ReactNode`로 라벨 양옆에 배치(gap=spacing-2). 새 variant는 색/보더 분기. 웹은 CSS Module data-attr, RN은 `useTheme()` 분기. 기존 prop/동작 불변.

**Tech Stack:** React 19, Vite(웹), tsc(RN), CSS Modules + 토큰, Vitest + jsdom + Testing Library, react-native-web(테스트), Next.js(docs). 변경: `@superbase/react`, `@superbase/react-native`, `apps/docs`.

> 전제: Phase 1 완료. 웹 Spinner = `<Spinner size="sm" color="..." />`(color는 CSS 색 문자열, `--spinner-color` 설정). RN Spinner = `<Spinner size="sm" color="..." />`(color는 색 문자열, 기본 brand). RN Button children은 string(라벨), 슬롯은 ReactNode. 신규 토큰 없음.
> 명령: `pnpm --filter @superbase/react test <path>`, `pnpm --filter @superbase/react-native test <path>`, 각 `typecheck`.

---

## Task 1: 웹 Button — loading/슬롯/fullWidth/ghost·outline

**Files:** Rewrite `packages/react/src/Button/Button.tsx`, `packages/react/src/Button/Button.module.css`. Test: `packages/react/src/Button/Button.test.tsx`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/react/src/Button/Button.test.tsx`의 describe 마지막 `});` 직전에 추가:
```tsx
  it("renders a spinner and blocks onClick while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /Save/ });
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders start/end icon slots", () => {
    render(
      <Button startIcon={<span data-testid="s" />} endIcon={<span data-testid="e" />}>
        Go
      </Button>,
    );
    expect(screen.getByTestId("s")).toBeInTheDocument();
    expect(screen.getByTestId("e")).toBeInTheDocument();
  });

  it("supports ghost/outline variants and fullWidth", () => {
    render(
      <Button variant="outline" fullWidth>
        X
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "X" });
    expect(btn).toHaveAttribute("data-variant", "outline");
    expect(btn).toHaveAttribute("data-full-width", "true");
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test src/Button/Button.test.tsx`
Expected: 새 케이스 FAIL(loading/슬롯/variant 미구현).

- [ ] **Step 3: Button.tsx 전체 교체**
```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const spinnerColorFor: Record<ButtonVariant, string> = {
  primary: "var(--color-white)",
  secondary: "var(--color-text-primary)",
  ghost: "var(--color-brand-primary)",
  outline: "var(--color-text-primary)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    className,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      aria-busy={loading || undefined}
      className={[styles.button, className].filter(Boolean).join(" ")}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <span className={styles.icon}>
          <Spinner size="sm" color={spinnerColorFor[variant]} aria-label="Loading" />
        </span>
      ) : startIcon ? (
        <span className={styles.icon}>{startIcon}</span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {!loading && endIcon ? <span className={styles.icon}>{endIcon}</span> : null}
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
  gap: var(--spacing-2);
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) var(--easing-standard);
}
.button:disabled { cursor: not-allowed; opacity: var(--opacity-disabled); }
.button[data-loading="true"] { cursor: default; }
.button[data-full-width="true"] { width: 100%; }
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.icon { display: inline-flex; align-items: center; }
.label { display: inline-flex; align-items: center; }
.button[data-size="sm"] { height: var(--size-button-sm); padding: 0 var(--spacing-3); font-size: var(--font-size-caption); }
.button[data-size="md"] { height: var(--size-button-md); padding: 0 var(--spacing-4); font-size: var(--font-size-body); }
.button[data-size="lg"] { height: var(--size-button-lg); padding: 0 var(--spacing-6); font-size: var(--font-size-title); }
.button[data-variant="primary"] { background: var(--color-brand-primary); color: var(--color-white); }
.button[data-variant="primary"]:hover:not(:disabled) { background: var(--color-brand-pressed); }
.button[data-variant="secondary"] { background: var(--color-background-subtle); color: var(--color-text-primary); }
.button[data-variant="secondary"]:hover:not(:disabled) { background: var(--color-border-default); }
.button[data-variant="ghost"] { background: transparent; color: var(--color-brand-primary); }
.button[data-variant="ghost"]:hover:not(:disabled) { background: var(--color-background-subtle); }
.button[data-variant="outline"] {
  background: transparent;
  color: var(--color-text-primary);
  border: var(--border-width-thin) solid var(--color-border-default);
}
.button[data-variant="outline"]:hover:not(:disabled) { background: var(--color-background-subtle); }
```

- [ ] **Step 5: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react test src/Button/Button.test.tsx` → PASS(기존 4 + 신규 3).
Run: `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/Button
git commit -m "feat(react): Button loading/icon-slots/fullWidth + ghost/outline variants"
```

---

## Task 2: RN Button — loading/슬롯/fullWidth/ghost·outline

**Files:** Rewrite `packages/react-native/src/Button/Button.tsx`. Test: `packages/react-native/src/Button/Button.test.tsx`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/react-native/src/Button/Button.test.tsx`의 describe 마지막 `});` 직전에 추가:
```tsx
  it("blocks onPress and shows a spinner while loading", () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} loading>
        Save
      </Button>,
    );
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders start/end icon slots", () => {
    render(
      <Button onPress={() => {}} startIcon={<span data-testid="s" />} endIcon={<span data-testid="e" />}>
        Go
      </Button>,
    );
    expect(screen.getByTestId("s")).toBeInTheDocument();
    expect(screen.getByTestId("e")).toBeInTheDocument();
  });
```
> RN Spinner(ActivityIndicator)는 기본 `accessibilityLabel="Loading"`(Phase 1c/1b에서 영문화) → `getByLabelText("Loading")`로 조회.

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test src/Button/Button.test.tsx`
Expected: 새 케이스 FAIL.

- [ ] **Step 3: Button.tsx 전체 교체**
```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";
import { Spinner } from "../Spinner/Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  // object/array styles only — Pressable's function-style form is intentionally
  // not supported so it can't be silently dropped into the style array below.
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const padFor: Record<ButtonSize, number> = {
    sm: t.spacing["3"],
    md: t.spacing["4"],
    lg: t.spacing["6"],
  };
  const bg =
    variant === "primary"
      ? t.color.brand.primary
      : variant === "secondary"
        ? t.color.background.subtle
        : "transparent";
  const fg =
    variant === "primary"
      ? "#ffffff"
      : variant === "ghost"
        ? t.color.brand.primary
        : t.color.text.primary;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={loading ? undefined : onPress}
      style={[
        {
          height: t.size.button[size],
          paddingHorizontal: padFor[size],
          borderRadius: t.radius.md,
          backgroundColor: bg,
          borderWidth: variant === "outline" ? t.borderWidth.thin : 0,
          borderColor: t.color.border.default,
          opacity: disabled ? t.opacity.disabled : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: t.spacing["2"],
          alignSelf: fullWidth ? "stretch" : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={fg} /> : startIcon}
      <RNText
        style={{
          color: fg,
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
        }}
      >
        {children}
      </RNText>
      {!loading ? endIcon : null}
    </Pressable>
  );
});
```
> 주: `disabled`만 opacity dim, `loading`은 dim하지 않고 상호작용만 차단(`disabled||loading` + onPress 가드). `alignSelf`는 fullWidth일 때만 stretch(기본 미설정=기존 동작 유지, 하위호환).

- [ ] **Step 4: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/Button/Button.test.tsx` → PASS(기존 3 + 신규 2).
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 5: 커밋**
```bash
git add packages/react-native/src/Button/Button.tsx
git commit -m "feat(react-native): Button loading/icon-slots/fullWidth + ghost/outline variants"
```

---

## Task 3: docs Button 페이지 예시 추가

**Files:** Modify `apps/docs/app/components/button/page.tsx`.

이 페이지는 `"use client"`이고 `Button as WebButton`(@superbase/react), `Button as RNButton`(@superbase/react-native), `ComponentDoc`/`Tabs`/`Example`/`Code`/`ClientOnly`를 import하며, `webContent`/`nativeContent` 프래그먼트 안에 `<Example>` 블록들이 있고 `<Tabs items={[{web},{native}]}>`로 렌더한다.

- [ ] **Step 1: 아이콘 import 추가**

파일 상단 import에 추가(웹·RN Icon):
```tsx
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
```
(기존 WebButton/RNButton import은 유지.)

- [ ] **Step 2: webContent에 예시 추가**

`webContent` 프래그먼트(`<> ... </>`) 안, 마지막 기존 `<Example>` **뒤**에 추가:
```tsx
    <Example
      title="loading"
      description={<><Code>loading</Code>으로 작업 중 상태를 표시합니다. 스피너가 보이고 클릭이 막힙니다.</>}
      code={`<Button loading>저장 중</Button>`}
    >
      <WebButton loading>저장 중</WebButton>
    </Example>

    <Example
      title="아이콘 슬롯"
      description={<><Code>startIcon</Code>·<Code>endIcon</Code>으로 라벨 양옆에 아이콘을 넣습니다.</>}
      code={`<Button startIcon={<Icon name="check" />}>완료</Button>\n<Button endIcon={<Icon name="chevron-right" />}>다음</Button>`}
    >
      <WebButton startIcon={<WebIcon name="check" />}>완료</WebButton>
      <WebButton variant="secondary" endIcon={<WebIcon name="chevron-right" />}>다음</WebButton>
    </Example>

    <Example
      title="variant 확장"
      description={<><Code>ghost</Code>·<Code>outline</Code> variant를 추가로 지원합니다.</>}
      code={`<Button variant="ghost">Ghost</Button>\n<Button variant="outline">Outline</Button>`}
    >
      <WebButton variant="ghost">Ghost</WebButton>
      <WebButton variant="outline">Outline</WebButton>
    </Example>

    <Example
      title="fullWidth"
      description={<><Code>fullWidth</Code>로 가로를 꽉 채웁니다.</>}
      code={`<Button fullWidth>전체 너비</Button>`}
    >
      <div style={{ width: "100%" }}>
        <WebButton fullWidth>전체 너비</WebButton>
      </div>
    </Example>
```

- [ ] **Step 3: nativeContent에 예시 추가**

`nativeContent` 프래그먼트 안, 마지막 기존 `<Example>` 뒤에 추가(RN은 `onPress` 관용 + `ClientOnly`):
```tsx
    <Example
      title="loading"
      description={<><Code>loading</Code>으로 작업 중 상태를 표시합니다. 스피너가 보이고 onPress가 막힙니다.</>}
      code={`<Button loading onPress={fn}>저장 중</Button>`}
    >
      <ClientOnly>
        <RNButton loading onPress={() => {}}>저장 중</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="아이콘 슬롯"
      description={<><Code>startIcon</Code>·<Code>endIcon</Code>으로 라벨 양옆에 아이콘을 넣습니다.</>}
      code={`<Button startIcon={<Icon name="check" />} onPress={fn}>완료</Button>`}
    >
      <ClientOnly>
        <RNButton startIcon={<RNIcon name="check" color="#ffffff" />} onPress={() => {}}>완료</RNButton>
        <RNButton variant="secondary" endIcon={<RNIcon name="chevron-right" />} onPress={() => {}}>다음</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="variant 확장"
      description={<><Code>ghost</Code>·<Code>outline</Code> variant를 추가로 지원합니다.</>}
      code={`<Button variant="ghost" onPress={fn}>Ghost</Button>\n<Button variant="outline" onPress={fn}>Outline</Button>`}
    >
      <ClientOnly>
        <RNButton variant="ghost" onPress={() => {}}>Ghost</RNButton>
        <RNButton variant="outline" onPress={() => {}}>Outline</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="fullWidth"
      description={<><Code>fullWidth</Code>로 가로를 꽉 채웁니다.</>}
      code={`<Button fullWidth onPress={fn}>전체 너비</Button>`}
    >
      <ClientOnly>
        <RNButton fullWidth onPress={() => {}}>전체 너비</RNButton>
      </ClientOnly>
    </Example>
```

- [ ] **Step 4: 타입체크 + 빌드**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(`/components/button` 빌드).

- [ ] **Step 5: 커밋**
```bash
git add apps/docs/app/components/button/page.tsx
git commit -m "docs: Button loading/icon-slots/variants/fullWidth examples (web+RN)"
```

---

## Task 4: 전체 검증 + changeset

**Files:** Create `.changeset/phase2a-button.md`.

- [ ] **Step 1: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과. 기존 Button 테스트 + 신규(웹 3, RN 2) 통과. 웹/RN 빌드 성공(Button→Spinner 내부 import 해소).

- [ ] **Step 2: changeset 작성**

Create `.changeset/phase2a-button.md`:
```md
---
"@superbase/react": minor
"@superbase/react-native": minor
---

Button 심화: `loading`(내부 Spinner + 상호작용 차단 + aria-busy), `startIcon`/`endIcon` 슬롯, `fullWidth`, 그리고 `ghost`·`outline` variant 추가. 전부 추가만이라 하위호환.
```

- [ ] **Step 3: 커밋**
```bash
git add .changeset/phase2a-button.md
git commit -m "chore: changeset for Button depth (2a)"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 기존 Button 테스트 무회귀 + 신규 케이스 통과.
- 웹·RN Button이 `loading`·`startIcon`/`endIcon`·`fullWidth`·`ghost`/`outline`을 지원(API 패리티). loading은 상호작용 차단·스피너·aria-busy, dim 아님(disabled와 구분).
- docs Button 페이지에 4개 신규 예시(Web/RN 탭 둘 다), `/components/button` 빌드 성공.
- changeset로 react·react-native minor 예약.

## 이후
- **Plan 2b — TextField 심화**(size/prefix·suffix/clearable/helperText + 토큰 field-sm/lg). 2a 머지 후 현재 코드 기준으로 작성.
- **Plan 2c — 작은 컴포넌트 + Icon 스케일**.
