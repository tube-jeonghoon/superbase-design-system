# Plan 6 — `@superbase/react-native` 4종 패리티 (v0.2) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/react`에 추가한 Checkbox·RadioGroup+Radio·Badge·Spinner를 `@superbase/react-native`에도 동일 API로 추가하고, changeset으로 react-native minor를 예약한다.

**Architecture:** Plan 4 RN 패턴 그대로 — `react-native` 프리미티브(Pressable/View/Text/ActivityIndicator) 사용, `@superbase/tokens/native`의 숫자/색 토큰 소비(status 색 포함), dev/test/types는 react-native-web alias로 jsdom+Vitest 헤드리스 테스트, tsc 빌드. Radio는 React Context로 그룹 상태 공유(웹과 동일 구조).

**Tech Stack:** React 19, React Native(peer) + react-native-web(test/types), TypeScript 5(tsc), Vitest 2 + jsdom + Testing Library, Changesets. 단일 vite 5 핀.

> 전제: Plan 4·5가 `main`에 있음. `@superbase/react-native`는 Text/Button/TextField/Stack/Switch를 export(13 테스트). `@superbase/tokens/native`는 이제 `ColorStatusInfo/Success/Warning/Danger`(hex 문자열) + 숫자 사이즈/색 토큰을 방출. 테스트: `pnpm --filter @superbase/react-native test`. Node 22, pnpm 10.27.0.

> 참고(RNW 동작 검증 필요): react-native-web 0.19에서 `accessibilityRole="checkbox"|"radio"` → ARIA role, `accessibilityState={{ checked }}` → aria-checked, `accessibilityLabel` → aria-label로 매핑됨. 실제 렌더가 예상과 다르면 **테스트의 쿼리(getByRole/getByLabelText)를 실제 출력에 맞추되 동작 의미는 유지**하고 보고하라. `ActivityIndicator`의 접근성 렌더도 실제로 확인.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/react-native/src/Checkbox/Checkbox.tsx` + `.test.tsx` | Checkbox |
| `packages/react-native/src/Radio/RadioContext.ts` + `RadioGroup.tsx` + `Radio.tsx` + `Radio.test.tsx` | Radio |
| `packages/react-native/src/Badge/Badge.tsx` + `.test.tsx` | Badge |
| `packages/react-native/src/Spinner/Spinner.tsx` + `.test.tsx` | Spinner |
| `packages/react-native/src/index.ts` (수정) | export 추가 |
| `.changeset/rn-components-v0-2.md` | react-native minor 예약 |

---

## Task 1: Checkbox (RN, TDD)

**Files:** Create `packages/react-native/src/Checkbox/Checkbox.tsx`, `Checkbox.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Checkbox/Checkbox.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox (RN)", () => {
  it("exposes checkbox role with checked state", () => {
    render(<Checkbox checked onChange={() => {}} accessibilityLabel="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
  });

  it("calls onChange with the toggled value", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} accessibilityLabel="x" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled accessibilityLabel="x" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Checkbox/Checkbox.tsx`**

```tsx
import {
  Pressable,
  View,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  ColorBrandPrimary,
  ColorBorderDefault,
  ColorBackgroundDefault,
  ColorWhite,
  ColorTextPrimary,
  RadiusSm,
  Spacing2,
  FontSizeBody,
} from "@superbase/tokens/native";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style" | "onPress"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  style,
  ...rest
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing2,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: RadiusSm,
          borderWidth: 2,
          borderColor: checked ? ColorBrandPrimary : ColorBorderDefault,
          backgroundColor: checked ? ColorBrandPrimary : ColorBackgroundDefault,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View style={{ width: 10, height: 10, borderRadius: 1, backgroundColor: ColorWhite }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: FontSizeBody, color: ColorTextPrimary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
}
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS. (RNW에서 role/checked가 다르게 나오면 위 참고대로 테스트 쿼리를 맞추고 보고.)

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Checkbox } from "./Checkbox/Checkbox";
export type { CheckboxProps } from "./Checkbox/Checkbox";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Checkbox packages/react-native/src/index.ts
git commit -m "feat(react-native): add Checkbox component"
```

---

## Task 2: RadioGroup + Radio (RN, TDD)

**Files:** Create `packages/react-native/src/Radio/RadioContext.ts`, `RadioGroup.tsx`, `Radio.tsx`, `Radio.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Radio/Radio.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "./Radio";

describe("RadioGroup + Radio (RN)", () => {
  it("reflects the group value as checked state", () => {
    render(
      <RadioGroup value="b">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it("calls the group onChange with the selected value", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("throws when a Radio is used outside a RadioGroup", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="a" label="A" />)).toThrow(
      "Radio must be used within a RadioGroup",
    );
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

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

- [ ] **Step 4: `src/Radio/RadioGroup.tsx`**

```tsx
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { RadioContext } from "./RadioContext";
import { Spacing2 } from "@superbase/tokens/native";

export interface RadioGroupProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export function RadioGroup({ value, onChange, children, style, ...rest }: RadioGroupProps) {
  return (
    <View style={[{ gap: Spacing2 }, style]} {...rest}>
      <RadioContext.Provider value={{ value, onChange }}>{children}</RadioContext.Provider>
    </View>
  );
}
```

- [ ] **Step 5: `src/Radio/Radio.tsx`**

```tsx
import { Pressable, View, Text as RNText } from "react-native";
import { useRadioContext } from "./RadioContext";
import {
  ColorBrandPrimary,
  ColorBorderDefault,
  ColorBackgroundDefault,
  ColorTextPrimary,
  RadiusFull,
  Spacing2,
  FontSizeBody,
} from "@superbase/tokens/native";

export interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
}

export function Radio({ value, label, disabled = false }: RadioProps) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => group.onChange?.(value)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing2,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: RadiusFull,
          borderWidth: 2,
          borderColor: checked ? ColorBrandPrimary : ColorBorderDefault,
          backgroundColor: ColorBackgroundDefault,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View style={{ width: 10, height: 10, borderRadius: RadiusFull, backgroundColor: ColorBrandPrimary }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: FontSizeBody, color: ColorTextPrimary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
}
```

> 주: `accessibilityLabel={label}`로 라디오의 접근성 이름을 명시 → `getByRole("radio", { name })`이 안정적으로 동작. RadioGroup은 `accessibilityRole`을 지정하지 않는다(RN 타입에 'radiogroup'이 없을 수 있음). 테스트는 라디오 role로만 조회.

- [ ] **Step 6: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 7: `src/index.ts` 끝에 추가**

```ts
export { RadioGroup } from "./Radio/RadioGroup";
export type { RadioGroupProps } from "./Radio/RadioGroup";
export { Radio } from "./Radio/Radio";
export type { RadioProps } from "./Radio/Radio";
```

- [ ] **Step 8: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Radio packages/react-native/src/index.ts
git commit -m "feat(react-native): add RadioGroup and Radio components"
```

---

## Task 3: Badge (RN, TDD)

**Files:** Create `packages/react-native/src/Badge/Badge.tsx`, `Badge.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Badge/Badge.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge (RN)", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("accepts variant without error", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Badge/Badge.tsx`**

```tsx
import { View, Text as RNText, type TextStyle } from "react-native";
import {
  ColorBackgroundSubtle,
  ColorTextSecondary,
  ColorBrandPrimary,
  ColorWhite,
  ColorStatusSuccess,
  ColorStatusWarning,
  ColorStatusDanger,
  RadiusFull,
  Spacing2,
  FontSizeCaption,
} from "@superbase/tokens/native";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

const bgFor: Record<BadgeVariant, string> = {
  neutral: ColorBackgroundSubtle,
  brand: ColorBrandPrimary,
  success: ColorStatusSuccess,
  warning: ColorStatusWarning,
  danger: ColorStatusDanger,
};
const fgFor: Record<BadgeVariant, string> = {
  neutral: ColorTextSecondary,
  brand: ColorWhite,
  success: ColorWhite,
  warning: ColorWhite,
  danger: ColorWhite,
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 2,
        paddingHorizontal: Spacing2,
        borderRadius: RadiusFull,
        backgroundColor: bgFor[variant],
      }}
    >
      <RNText
        style={{ fontSize: FontSizeCaption, fontWeight: "500" as TextStyle["fontWeight"], color: fgFor[variant] }}
      >
        {children}
      </RNText>
    </View>
  );
}
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Badge } from "./Badge/Badge";
export type { BadgeProps, BadgeVariant } from "./Badge/Badge";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Badge packages/react-native/src/index.ts
git commit -m "feat(react-native): add Badge component"
```

---

## Task 4: Spinner (RN, TDD)

**Files:** Create `packages/react-native/src/Spinner/Spinner.tsx`, `Spinner.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Spinner/Spinner.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner (RN)", () => {
  it("renders with an accessible label", () => {
    render(<Spinner accessibilityLabel="불러오는 중" />);
    expect(screen.getByLabelText("불러오는 중")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Spinner/Spinner.tsx`**

```tsx
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { ColorBrandPrimary } from "@superbase/tokens/native";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "size" | "color"> {
  size?: SpinnerSize;
  color?: string;
}

const sizeFor: Record<SpinnerSize, ActivityIndicatorProps["size"]> = {
  sm: "small",
  md: 28,
  lg: "large",
};

export function Spinner({ size = "md", color = ColorBrandPrimary, ...rest }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={sizeFor[size]}
      color={color}
      accessibilityLabel="로딩 중"
      {...rest}
    />
  );
}
```

> 주: `accessibilityLabel`은 기본값 "로딩 중"이며, `...rest`로 전달된 `accessibilityLabel`이 이를 덮어쓴다(테스트가 "불러오는 중"을 넘김). RNW의 `ActivityIndicator`가 `aria-label`을 렌더하지 않으면(검증 필요), 테스트를 `getByRole("progressbar")` 또는 testID 기반으로 조정하되 접근성 라벨 전달 의미는 유지하라.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Spinner } from "./Spinner/Spinner";
export type { SpinnerProps, SpinnerSize } from "./Spinner/Spinner";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Spinner packages/react-native/src/index.ts
git commit -m "feat(react-native): add Spinner component"
```

---

## Task 5: changeset + 빌드 + 전체 검증

**Files:** Create `.changeset/rn-components-v0-2.md`

- [ ] **Step 1: changeset 작성 — `.changeset/rn-components-v0-2.md`**

```markdown
---
"@superbase/react-native": minor
---

모바일 컴포넌트 Checkbox, RadioGroup+Radio, Badge, Spinner를 추가한다(웹과 동일 API).
```

- [ ] **Step 2: RN 라이브러리 빌드 확인**

Run: `pnpm --filter @superbase/react-native build`
Expected: tsc가 `dist`에 신규 컴포넌트의 js + d.ts를 방출. `grep -rn "react-native-web" packages/react-native/dist` 결과가 비어야 한다(별칭 누출 없음).

- [ ] **Step 3: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: tokens·react·docs·react-native 전부 통과. react-native 테스트가 기존 13 + Checkbox 3 + Radio 3 + Badge 2 + Spinner 1 = 22로 증가(실제 수치 보고).

- [ ] **Step 4: Commit**

```bash
git add .changeset/rn-components-v0-2.md
git commit -m "chore(react-native): changeset for v0.2 mobile components"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 4개 워크스페이스 전부 통과한다.
- `@superbase/react-native`가 Checkbox, RadioGroup, Radio, Badge, Spinner를 추가로 export한다(웹과 동일 prop 의미).
- RN 컴포넌트가 `@superbase/tokens/native`(status 색 포함)를 소비한다.
- tsc 빌드 dist에 react-native-web 누출이 없다.
- `.changeset/rn-components-v0-2.md`가 react-native를 minor로 예약 → 머지 시 버전 PR이 react-native 0.2.0을 포함하도록 갱신된다.

## 이후

- 배포: 버전 PR(#1)이 web+RN 모두 0.2.0으로 갱신됨 → NPM_TOKEN 설정 후 PR 머지하면 3패키지 0.2.0 일괄 배포.
- 다음 단계(사용자 순서): **아이콘 세트** → 문서 사이트 배포 → vite 버전 정합.
