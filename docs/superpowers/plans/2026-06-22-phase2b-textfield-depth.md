# Plan 2b — TextField 심화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 웹·RN TextField에 `size`(sm/md/lg), `prefix`/`suffix` 슬롯, `clearable`, `helperText`를 추가한다(전부 추가만, non-breaking). 신규 size 토큰 `field-sm`/`field-lg`를 추가한다.

**Architecture:** 입력칸을 `control` 컨테이너(flex row)로 감싸고 보더·높이·포커스링을 그 컨테이너로 옮긴다(웹 `:focus-within`, RN row View). 컨테이너 안에 `prefix` → input → clear 버튼(clearable+값) → `suffix` 순으로 배치. helperText는 error가 없을 때 컨테이너 아래에 표시. clear 버튼은 패키지 `Icon`(name="close")을 사용. 기존 prop/동작 불변.

**Tech Stack:** React 19, Vite(웹), tsc(RN), Style Dictionary(토큰), CSS Modules + 토큰, Vitest + jsdom + Testing Library, Next.js(docs). 변경: `@superbase/tokens`, `@superbase/react`, `@superbase/react-native`, `apps/docs`.

> 전제: Phase 1·2a 완료. 토큰 빌드: `node build.mjs`가 `TOKENS_DIST` env로 출력 경로 분기(테스트는 temp dir). 웹 Icon=`<Icon name="close" size={16} />`(currentColor 스트로크). RN Icon=`<Icon name="close" size={16} color="..." />`. RN TextField는 `onChangeText`/`value` 사용.
> 명령: `pnpm --filter @superbase/tokens test`, `pnpm --filter @superbase/react test <path>`, `pnpm --filter @superbase/react-native test <path>`, 각 `typecheck`.

---

## Task 1: 토큰 — field-sm / field-lg

**Files:** Modify `packages/tokens/src/sizing.json`, `packages/tokens/build.mjs`(themeDts 타입), `packages/tokens/test/build.test.ts`, `packages/tokens/test/theme.test.ts`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/tokens/test/build.test.ts`의 snapshot 케이스들 앞에 추가:
```ts
  it("emits field size variant tokens (web + native)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--size-field-sm: 40px;");
    expect(css).toContain("--size-field-lg: 56px;");
    const js = readFileSync(join(pkgRoot, "dist/native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeFieldSm = 40;");
    expect(js).toContain("export const SizeFieldLg = 56;");
  });
```
`packages/tokens/test/theme.test.ts`의 두 번째 it(`lightTheme and darkTheme have the expected shared shape...`) 안, `expect(lightTheme.size.control).toBe(20);` 줄 **뒤**에 추가:
```ts
    expect(lightTheme.size.fieldSm).toBe(40);
    expect(lightTheme.size.fieldLg).toBe(56);
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: 새 단언 FAIL(`--size-field-sm` / `size.fieldSm` 미존재).

- [ ] **Step 3: sizing.json에 토큰 추가**

`packages/tokens/src/sizing.json`의 `"field": { "value": "48px" },` 줄 **뒤**에 추가:
```json
    "fieldSm": { "value": "40px" },
    "fieldLg": { "value": "56px" },
```
(결과: `control`, `field`, `fieldSm`, `fieldLg`, `button`, `switch`, `icon` 순. `field`(48)는 md로 계속 사용.)

- [ ] **Step 4: build.mjs의 themeDts에 타입 추가**

`packages/tokens/build.mjs`의 `themeDts()` 안 `size:` 인터페이스에서 `field: number;` 줄 뒤에 `fieldSm`/`fieldLg`를 추가. 해당 블록을 아래로 만든다:
```js
  size: {
    control: number;
    field: number;
    fieldSm: number;
    fieldLg: number;
    button: { sm: number; md: number; lg: number };
    switch: { width: number; height: number; thumb: number };
    icon: { sm: number; md: number; lg: number };
  };
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS(build.test 신규 + theme.test 신규). RN 테마 객체 `size.fieldSm/fieldLg`는 sizing.json에서 자동 포함(strip이 size 트리를 그대로 가져옴).

- [ ] **Step 6: 커밋**
```bash
git add packages/tokens/src/sizing.json packages/tokens/build.mjs packages/tokens/test/build.test.ts packages/tokens/test/theme.test.ts
git commit -m "feat(tokens): add field size variant tokens (field-sm 40, field-lg 56)"
```

---

## Task 2: 웹 TextField — size/prefix·suffix/clearable/helperText

**Files:** Rewrite `packages/react/src/TextField/TextField.tsx`, `packages/react/src/TextField/TextField.module.css`. Test: `packages/react/src/TextField/TextField.test.tsx`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/react/src/TextField/TextField.test.tsx`의 describe 마지막 `});` 직전에 추가:
```tsx
  it("applies the size data attribute to the control", () => {
    const { container } = render(<TextField label="L" size="lg" />);
    expect(container.querySelector('[data-size="lg"]')).not.toBeNull();
  });

  it("renders prefix and suffix slots", () => {
    render(<TextField label="L" prefix={<span data-testid="p" />} suffix={<span data-testid="s" />} />);
    expect(screen.getByTestId("p")).toBeInTheDocument();
    expect(screen.getByTestId("s")).toBeInTheDocument();
  });

  it("shows a clear button when clearable with a value and clears on click", async () => {
    const onChange = vi.fn();
    render(<TextField label="L" clearable value="hi" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows helper text when there is no error", () => {
    render(<TextField label="L" helperText="도움말" />);
    expect(screen.getByText("도움말")).toBeInTheDocument();
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test src/TextField/TextField.test.tsx`
Expected: 새 케이스 FAIL.

- [ ] **Step 3: TextField.tsx 전체 교체**
```tsx
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./TextField.module.css";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "prefix"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: TextFieldSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, helperText, id, value, onChange, size = "md", prefix, suffix, clearable = false, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const showClear = clearable && value != null && value !== "";
  const describedBy = error ? errorId : helperText ? helperId : undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <div className={styles.control} data-size={size} data-error={error ? "true" : undefined}>
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...rest}
        />
        {showClear ? (
          <button type="button" className={styles.clear} aria-label="Clear" onClick={() => onChange?.("")}>
            <Icon name="close" size={16} />
          </button>
        ) : null}
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
      </div>
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className={styles.helper}>
          {helperText}
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
.control {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: var(--size-field);
  padding: 0 var(--spacing-4);
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-background-default);
  transition: border-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}
.control[data-size="sm"] { height: var(--size-field-sm); }
.control[data-size="lg"] { height: var(--size-field-lg); }
.control:focus-within {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
}
.control[data-error="true"] { border-color: var(--color-status-danger); }
.input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  padding: 0;
  background: transparent;
  font-family: inherit;
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}
.affix { display: inline-flex; align-items: center; color: var(--color-text-secondary); flex-shrink: 0; }
.clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.clear:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-sm);
}
.error { font-size: var(--font-size-caption); color: var(--color-status-danger); }
.helper { font-size: var(--font-size-caption); color: var(--color-text-secondary); }
```
> 변경점: 보더/높이/포커스링이 `.input`→`.control`로 이동(`:focus-within`). `.input`은 borderless flex:1. data-error/data-size는 `.control`. error span은 그대로 role="alert".

- [ ] **Step 5: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react test src/TextField/TextField.test.tsx` → PASS(기존 5 + 신규 4).
Run: `pnpm --filter @superbase/react typecheck` → exit 0.

- [ ] **Step 6: 커밋**
```bash
git add packages/react/src/TextField
git commit -m "feat(react): TextField size/prefix-suffix/clearable/helperText"
```

---

## Task 3: RN TextField — size/prefix·suffix/clearable/helperText

**Files:** Rewrite `packages/react-native/src/TextField/TextField.tsx`. Test: `packages/react-native/src/TextField/TextField.test.tsx`.

- [ ] **Step 1: 실패 테스트 추가**

`packages/react-native/src/TextField/TextField.test.tsx`의 describe 마지막 `});` 직전에 추가:
```tsx
  it("renders prefix and suffix slots", () => {
    render(<TextField label="L" prefix={<span data-testid="p" />} suffix={<span data-testid="s" />} />);
    expect(screen.getByTestId("p")).toBeInTheDocument();
    expect(screen.getByTestId("s")).toBeInTheDocument();
  });

  it("shows a clear button when clearable with a value and clears on press", () => {
    const onChangeText = vi.fn();
    render(<TextField label="L" clearable value="hi" onChangeText={onChangeText} />);
    fireEvent.click(screen.getByLabelText("Clear"));
    expect(onChangeText).toHaveBeenCalledWith("");
  });

  it("renders helper text when there is no error", () => {
    render(<TextField label="L" helperText="도움말" />);
    expect(screen.getByText("도움말")).toBeInTheDocument();
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test src/TextField/TextField.test.tsx`
Expected: 새 케이스 FAIL.

- [ ] **Step 3: TextField.tsx 전체 교체**
```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Text as RNText, TextInput, Pressable, type TextInputProps } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Icon } from "../Icon/Icon";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextFieldSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
}

export const TextField = forwardRef<ElementRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, helperText, size = "md", prefix, suffix, clearable = false, value, onChangeText, style, ...rest },
  ref,
) {
  const t = useTheme();
  const heightFor: Record<TextFieldSize, number> = {
    sm: t.size.fieldSm,
    md: t.size.field,
    lg: t.size.fieldLg,
  };
  const showClear = clearable && value != null && value !== "";
  return (
    <View style={{ gap: t.spacing["1"] }}>
      {label ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>
          {label}
        </RNText>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["2"],
          height: heightFor[size],
          paddingHorizontal: t.spacing["4"],
          borderWidth: t.borderWidth.thin,
          borderColor: error ? t.color.status.danger : t.color.border.default,
          borderRadius: t.radius.md,
          backgroundColor: t.color.background.default,
        }}
      >
        {prefix}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          style={[
            { flex: 1, height: "100%", padding: 0, fontSize: t.font.size.body, color: t.color.text.primary },
            style,
          ]}
          {...rest}
        />
        {showClear ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear" onPress={() => onChangeText?.("")}>
            <Icon name="close" size={16} color={t.color.text.secondary} />
          </Pressable>
        ) : null}
        {suffix}
      </View>
      {error ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.status.danger }}>{error}</RNText>
      ) : helperText ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>{helperText}</RNText>
      ) : null}
    </View>
  );
});
```

- [ ] **Step 4: 통과 + 타입체크**

Run: `pnpm --filter @superbase/react-native test src/TextField/TextField.test.tsx` → PASS(기존 3 + 신규 3).
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

- [ ] **Step 5: 커밋**
```bash
git add packages/react-native/src/TextField/TextField.tsx
git commit -m "feat(react-native): TextField size/prefix-suffix/clearable/helperText"
```

---

## Task 4: docs TextField 페이지 예시

**Files:** Modify `apps/docs/app/components/textfield/page.tsx`.

이 페이지는 `"use client"`이고 `TextField as WebTextField`(@superbase/react), `TextField as RNTextField`(@superbase/react-native), `ComponentDoc`/`Tabs`/`Example`/`Code`/`ClientOnly`를 import하며, 기본 export 함수 안에서 `useState`로 입력 상태를 들고 `webContent`/`nativeContent`를 만든 뒤 `<Tabs>`로 렌더한다.

먼저 `apps/docs/app/components/textfield/page.tsx`를 열어 현재 구조(상단 import, 기본 export 함수 안 useState들, webContent/nativeContent 정의 위치, 기존 `<Example>` 블록 끝)를 확인하라.

- [ ] **Step 1: import + 상태 추가**

상단 import에 추가:
```tsx
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
```
기본 export 함수 본문(기존 `useState` 옆)에 clearable/helper 데모용 상태 추가:
```tsx
  const [clearWeb, setClearWeb] = useState("지울 수 있어요");
  const [clearRn, setClearRn] = useState("지울 수 있어요");
```
(상단에 `import { useState } from "react";`가 이미 있다고 가정 — 없으면 추가.)

- [ ] **Step 2: webContent에 예시 추가** (마지막 기존 `<Example>` 뒤, 닫는 `</>` 앞)
```tsx
    <Example
      title="size"
      description={<><Code>size</Code>로 높이를 조절합니다(sm/md/lg).</>}
      code={`<TextField size="sm" label="Small" />\n<TextField size="lg" label="Large" />`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
        <WebTextField size="sm" label="Small" placeholder="sm" />
        <WebTextField size="lg" label="Large" placeholder="lg" />
      </div>
    </Example>

    <Example
      title="prefix / suffix"
      description={<><Code>prefix</Code>·<Code>suffix</Code>로 입력칸 좌/우에 아이콘 등을 넣습니다.</>}
      code={`<TextField prefix={<Icon name="search" />} placeholder="검색" />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField prefix={<WebIcon name="search" size={18} />} placeholder="검색" />
      </div>
    </Example>

    <Example
      title="clearable"
      description={<><Code>clearable</Code>로 값이 있을 때 ✕ 버튼을 노출합니다.</>}
      code={`<TextField clearable value={v} onChange={setV} />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField clearable value={clearWeb} onChange={setClearWeb} label="이름" />
      </div>
    </Example>

    <Example
      title="helperText"
      description={<><Code>helperText</Code>로 보조 설명을 답니다(에러가 있으면 에러가 우선).</>}
      code={`<TextField helperText="공개되지 않습니다" label="이메일" />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField helperText="공개되지 않습니다" label="이메일" placeholder="email@example.com" />
      </div>
    </Example>
```

- [ ] **Step 3: nativeContent에 예시 추가** (마지막 기존 `<Example>` 뒤, 닫는 `</>` 앞)
```tsx
    <Example
      title="size"
      description={<><Code>size</Code>로 높이를 조절합니다(sm/md/lg).</>}
      code={`<TextField size="sm" label="Small" />\n<TextField size="lg" label="Large" />`}
    >
      <ClientOnly>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
          <RNTextField size="sm" label="Small" placeholder="sm" />
          <RNTextField size="lg" label="Large" placeholder="lg" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="prefix / suffix"
      description={<><Code>prefix</Code>·<Code>suffix</Code>로 입력칸 좌/우에 아이콘 등을 넣습니다.</>}
      code={`<TextField prefix={<Icon name="search" />} placeholder="검색" />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField prefix={<RNIcon name="search" size={18} />} placeholder="검색" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="clearable"
      description={<><Code>clearable</Code>로 값이 있을 때 ✕ 버튼을 노출합니다.</>}
      code={`<TextField clearable value={v} onChangeText={setV} />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField clearable value={clearRn} onChangeText={setClearRn} label="이름" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="helperText"
      description={<><Code>helperText</Code>로 보조 설명을 답니다(에러가 있으면 에러가 우선).</>}
      code={`<TextField helperText="공개되지 않습니다" label="이메일" />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField helperText="공개되지 않습니다" label="이메일" placeholder="email@example.com" />
        </div>
      </ClientOnly>
    </Example>
```

- [ ] **Step 4: 타입체크 + 빌드**

먼저 컴포넌트 패키지를 빌드해 docs가 새 prop 타입을 보게 한다(중요 — docs는 dist의 .d.ts를 소비):
Run: `pnpm turbo run build --filter=@superbase/react --filter=@superbase/react-native`
Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(`/components/textfield` 빌드).

- [ ] **Step 5: 커밋**
```bash
git add apps/docs/app/components/textfield/page.tsx
git commit -m "docs: TextField size/prefix-suffix/clearable/helperText examples (web+RN)"
```

---

## Task 5: 전체 검증 + changeset

**Files:** Create `.changeset/phase2b-textfield.md`.

- [ ] **Step 1: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과. tokens(field-sm/lg) + 웹/RN TextField 신규 테스트 + 기존 무회귀.

- [ ] **Step 2: changeset 작성**

Create `.changeset/phase2b-textfield.md`:
```md
---
"@superbase/tokens": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

TextField 심화: `size`(sm/md/lg), `prefix`/`suffix` 슬롯, `clearable`(✕ 버튼), `helperText` 추가. 입력부를 control 컨테이너로 재구성(포커스링은 컨테이너 `:focus-within`). 신규 토큰 `--size-field-sm`(40)/`--size-field-lg`(56) 추가. 전부 추가만이라 하위호환.
```

- [ ] **Step 3: 커밋**
```bash
git add .changeset/phase2b-textfield.md
git commit -m "chore: changeset for TextField depth (2b)"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 기존 TextField 테스트 무회귀 + 신규(웹 4·RN 3·tokens 1+) 통과.
- 웹·RN TextField가 `size`·`prefix`/`suffix`·`clearable`·`helperText` 지원(API 패리티). 포커스링이 control 컨테이너로 이동(슬롯과 함께 자연스럽게).
- 토큰 `field-sm`/`field-lg` 추가(웹 CSS + RN 테마 `size.fieldSm/fieldLg` + 타입).
- docs TextField 페이지에 4개 신규 예시(Web/RN 탭), `/components/textfield` 빌드 성공.
- changeset로 tokens·react·react-native minor 예약.

## 이후
- **Plan 2c — 작은 컴포넌트(Checkbox indeterminate / Badge size·icon·dot / Switch·Radio size) + Icon 명명 크기**. 2b 머지 후 작성.
