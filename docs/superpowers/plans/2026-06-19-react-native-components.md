# Plan 4 — `@superbase/react-native` 모바일 컴포넌트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/react`와 동일한 API(Text, Button, TextField, Stack, Switch)를 가진 React Native 컴포넌트 패키지를 만들고, RN 친화적(숫자 단위)으로 개선된 `@superbase/tokens` native 출력을 소비한다.

**Architecture:** 컴포넌트는 `react-native` 프리미티브(View, Text, Pressable, TextInput)를 사용한다. 시뮬레이터 없이 검증하기 위해 dev/test/types는 `react-native-web`로 별칭(alias) 처리해 jsdom + Vitest + Testing Library로 테스트하고, 실제 소비자를 위해 `react-native`는 peerDependency로 둔다. 빌드는 `tsc`로 `dist`에 js + d.ts를 방출한다. 먼저 `@superbase/tokens`의 native 출력을 px→숫자로 변환하고 `.js`+`.d.ts`로 방출하도록 개선한다(웹 CSS 출력은 불변).

**Tech Stack:** React 19, React Native(peer) + react-native-web(test/types), TypeScript 5(tsc 빌드), Vitest 2 + jsdom + @testing-library/react, Style Dictionary 4(tokens native 개선). 단일 vite 5 핀 유지.

> 전제: Plan 1·2·3가 `main`에 머지됨. `@superbase/tokens`는 `dist/native/tokens.ts`(현재 `javascript/es6`, 값에 "px" 포함)와 web CSS를 방출. 루트 `pnpm.overrides.vite=5.4.21`. Node 22, pnpm 10.27.0.
> v1 한계: RN 컴포넌트는 native 토큰의 **light 값(정적)**만 사용한다. RN 다크 테마(런타임 ThemeProvider)는 v2 과제로 남긴다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `packages/tokens/style-dictionary.config.mjs` (수정) | native 플랫폼: px→숫자 transform + js/d.ts 방출 |
| `packages/tokens/package.json` (수정) | `exports["./native"]`를 js+types로 |
| `packages/tokens/test/build.test.ts` (수정) | native 산출물 경로/내용 검증 갱신 |
| `packages/react-native/package.json` | 패키지 메타, peer(react-native), exports |
| `packages/react-native/tsconfig.json` | tsc 빌드 설정 + react-native→react-native-web paths 별칭 |
| `packages/react-native/tsconfig.build.json` | 빌드 전용(emit) 설정 |
| `packages/react-native/vitest.config.ts` | jsdom + react-native→react-native-web resolve.alias |
| `packages/react-native/src/test-setup.ts` | jest-dom 매처 |
| `packages/react-native/src/index.ts` | 배럴 export |
| `packages/react-native/src/<Name>/<Name>.tsx` + `.test.tsx` | 컴포넌트 5종 |
| `packages/react-native/README.md` | 사용법 |

---

## Task 1: `@superbase/tokens` native 출력을 RN 친화적으로 개선 (px→숫자, js+d.ts)

**Files:** Modify `packages/tokens/style-dictionary.config.mjs`, `packages/tokens/build.mjs`, `packages/tokens/package.json`, `packages/tokens/test/build.test.ts`

- [ ] **Step 1: 실패 테스트로 갱신 — `packages/tokens/test/build.test.ts`**

기존 native 관련 테스트를 아래로 교체한다. (기존 `it("creates native TS tokens file with named exports", ...)` 블록을 찾아 다음으로 대체. 스냅샷 테스트의 native 경로도 `.js`로 바꾼다.)

먼저 `it("creates native TS tokens file with named exports", ...)` 를 아래로 교체:
```ts
  it("creates native JS tokens with numeric sizes and a d.ts", () => {
    const jsPath = join(pkgRoot, "dist/native/tokens.js");
    const dtsPath = join(pkgRoot, "dist/native/tokens.d.ts");
    expect(existsSync(jsPath)).toBe(true);
    expect(existsSync(dtsPath)).toBe(true);
    const js = readFileSync(jsPath, "utf8");
    // colors stay hex strings
    expect(js).toContain('export const ColorBlue500 = "#3182f6";');
    // px sizes become unitless numbers (RN-friendly)
    expect(js).toContain("export const Spacing4 = 16;");
    expect(js).toContain("export const FontSizeBody = 15;");
    const dts = readFileSync(dtsPath, "utf8");
    expect(dts).toContain("export const Spacing4");
  });
```
그리고 스냅샷 테스트 `it("matches the native TS output snapshot", ...)` 내부의 경로를 `dist/native/tokens.ts` → `dist/native/tokens.js`로 바꾼다. (스냅샷은 Step 4에서 갱신)

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/tokens test` → FAIL (`tokens.js`/`tokens.d.ts` 없음, 숫자 변환 안 됨).

- [ ] **Step 3: native 플랫폼을 커스텀 transform + js/d.ts로 변경 — `style-dictionary.config.mjs`**

파일 상단(`const cssFile = ...` 위)에 px→숫자 변환을 등록하는 함수를 추가하고, `lightConfig`의 `native` 플랫폼을 교체한다. Style Dictionary v4에서 커스텀 transform은 `StyleDictionary.registerTransform`로 등록한다 — 이를 `build.mjs`에서 빌드 인스턴스 생성 전에 호출하도록 한다. config 파일에는 transform 이름만 참조한다.

`style-dictionary.config.mjs`의 `lightConfig.platforms.native`를 아래로 교체:
```js
    native: {
      transforms: ["attribute/cti", "name/pascal", "color/css", "size/px-to-number"],
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.d.ts", format: "typescript/es6-declarations" }
      ]
    }
```

- [ ] **Step 4: 커스텀 transform 등록 + 빌드 — `build.mjs`**

`build.mjs` 상단(import 직후, 인스턴스 생성 전)에 transform 등록을 추가한다:
```js
StyleDictionary.registerTransform({
  name: "size/px-to-number",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof token.value === "string" && /^-?\d*\.?\d+px$/.test(token.value),
  transform: (token) => parseFloat(token.value),
});
```
(이미 `import StyleDictionary from "style-dictionary";`가 있으므로 그 아래에 둔다.)

- [ ] **Step 5: 빌드 후 실제 출력 확인 + 스냅샷 갱신**

Run: `pnpm --filter @superbase/tokens build`
그 다음 실제 출력을 확인하라:
```bash
sed -n '1,40p' packages/tokens/dist/native/tokens.js
sed -n '1,20p' packages/tokens/dist/native/tokens.d.ts
```
기대: 색은 `export const ColorBlue500 = "#3182f6";`, 크기는 `export const Spacing4 = 16;` / `export const FontSizeBody = 15;`(숫자, 따옴표 없음), radius `RadiusFull = 9999` 등. d.ts는 각 const의 타입 선언.

검증/적응: `javascript/es6` 포맷이 숫자를 따옴표 없이 출력하는지 확인하라. 만약 숫자가 문자열로(예: `"16"`) 출력되면, transform이 number를 반환하는지(parseFloat) 점검하고, 그래도 포맷이 문자열화하면 Step 1 테스트의 기대값을 실제 출력에 맞추되 **반드시 RN에서 쓸 수 있는 형태(숫자 또는 숫자 문자열)**인지 확인하고 보고하라. fontWeight(`"400"` 등 px 아님)는 문자열로 남아야 하며 RN에서 허용된다.

스냅샷 갱신: `pnpm --filter @superbase/tokens test -u` 로 native 스냅샷을 새 출력으로 갱신한 뒤, `pnpm --filter @superbase/tokens test`로 전부 통과 확인. web CSS 스냅샷은 변하지 않아야 한다(웹 출력 불변).

- [ ] **Step 6: `packages/tokens/package.json`의 native export를 js+types로 변경**

`exports`를 아래로 교체:
```json
  "exports": {
    "./css": "./dist/web/variables.css",
    "./native": { "types": "./dist/native/tokens.d.ts", "import": "./dist/native/tokens.js" }
  },
```

- [ ] **Step 7: typecheck + commit**

Run: `pnpm --filter @superbase/tokens typecheck` → exit 0.
Run: `pnpm --filter @superbase/tokens test` → 전부 PASS.
```bash
git add packages/tokens/style-dictionary.config.mjs packages/tokens/build.mjs packages/tokens/package.json packages/tokens/test
git commit -m "feat(tokens): emit RN-friendly native tokens (numeric sizes, js + d.ts)"
```

---

## Task 2: `@superbase/react-native` 패키지 스캐폴드 + 테스트 하니스

**Files:** Create `packages/react-native/package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`, `src/test-setup.ts`, `src/index.ts`, `src/smoke.test.tsx`

- [ ] **Step 1: `packages/react-native/package.json`**

```json
{
  "name": "@superbase/react-native",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.74"
  },
  "dependencies": {
    "@superbase/tokens": "workspace:*"
  },
  "devDependencies": {
    "@superbase/tokens": "workspace:*",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-native-web": "^0.19.13",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

> 주: `react-native`은 peer로만 둔다(실제 앱이 제공). dev/test/types는 `react-native-web`이 `react-native` import를 대체한다.

- [ ] **Step 2: `packages/react-native/tsconfig.json` (typecheck용 — react-native→react-native-web 별칭)**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"],
    "paths": {
      "react-native": ["../../node_modules/react-native-web"]
    }
  },
  "include": ["src", "vitest.config.ts"]
}
```

- [ ] **Step 3: `packages/react-native/tsconfig.build.json` (emit용)**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.tsx", "src/test-setup.ts", "vitest.config.ts"]
}
```

> 주: `paths` 별칭은 타입 체크에만 영향을 주고 emit된 import 경로는 `react-native` 그대로 유지된다(소비자의 Metro가 해석). 

- [ ] **Step 4: `packages/react-native/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "react-native": "react-native-web" },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 5: `packages/react-native/src/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: `packages/react-native/src/index.ts`**

```ts
export {};
```

- [ ] **Step 7: 스모크 테스트 — `packages/react-native/src/smoke.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Text } from "react-native";

describe("rn test harness", () => {
  it("renders react-native primitives via react-native-web", () => {
    render(<Text>harness-ok</Text>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: 설치 + 스모크 + typecheck**

Run: `pnpm install` (resolved react-native-web 버전 보고).
Run: `pnpm turbo run build --filter=@superbase/tokens` (RN이 소비할 native 산출물 보장).
Run: `pnpm --filter @superbase/react-native test` → PASS (1 test). react-native-web가 `Text`를 DOM으로 렌더.
Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.

검증/적응: `react-native-web` 타입이 `react-native` import에 대해 paths 별칭으로 잡히는지 확인. 만약 typecheck가 react-native 타입을 못 찾으면(`Cannot find module 'react-native'`), paths의 상대경로가 실제 `node_modules/react-native-web` 위치와 맞는지 확인하고 조정하라(워크스페이스 hoisting으로 루트 `node_modules`에 있을 것). 변경 사항을 보고하라.

- [ ] **Step 9: Commit**

```bash
git add packages/react-native/package.json packages/react-native/tsconfig.json packages/react-native/tsconfig.build.json packages/react-native/vitest.config.ts packages/react-native/src pnpm-lock.yaml
git commit -m "feat(react-native): scaffold RN package with react-native-web test harness"
```

---

## Task 3: Text (RN, TDD)

**Files:** Create `packages/react-native/src/Text/Text.tsx`, `Text.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Text/Text.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text (RN)", () => {
  it("renders its children", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("accepts variant/weight/color props without error", () => {
    render(
      <Text variant="title" weight="bold" color="brand">
        Hi
      </Text>,
    );
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Text/Text.tsx`**

```tsx
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import {
  ColorTextPrimary,
  ColorTextSecondary,
  ColorTextDisabled,
  ColorBrandPrimary,
  FontSizeCaption,
  FontSizeBody,
  FontSizeTitle,
  FontSizeDisplay,
  FontWeightRegular,
  FontWeightMedium,
  FontWeightBold,
} from "@superbase/tokens/native";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
}

const sizeFor: Record<TextVariant, number> = {
  caption: FontSizeCaption,
  body: FontSizeBody,
  title: FontSizeTitle,
  display: FontSizeDisplay,
};
// token weight values are strings like "400"/"500"/"700" — valid RN fontWeight.
const weightFor: Record<TextWeight, TextStyle["fontWeight"]> = {
  regular: FontWeightRegular as TextStyle["fontWeight"],
  medium: FontWeightMedium as TextStyle["fontWeight"],
  bold: FontWeightBold as TextStyle["fontWeight"],
};
const colorFor: Record<TextColor, string> = {
  primary: ColorTextPrimary,
  secondary: ColorTextSecondary,
  disabled: ColorTextDisabled,
  brand: ColorBrandPrimary,
};

export function Text({
  variant = "body",
  weight = "regular",
  color = "primary",
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        {
          fontSize: sizeFor[variant],
          fontWeight: weightFor[weight],
          color: colorFor[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
```

> 주: 토큰 weight 값("400"/"500"/"700")은 px가 없어 Task 1의 px→숫자 변환 대상이 아니므로 **문자열**로 남고, RN의 `TextStyle["fontWeight"]` 리터럴 유니온과 호환된다. 위처럼 `as TextStyle["fontWeight"]`로 단언한다(동작 의미 유지). Button 등 다른 곳의 fontWeight도 동일 방식으로 처리하라.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 교체**

```ts
export { Text } from "./Text/Text";
export type { TextProps, TextVariant, TextWeight, TextColor } from "./Text/Text";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0 (필요 시 Step 3 주석대로 fontWeight 타입 정리).
```bash
git add packages/react-native/src/Text packages/react-native/src/index.ts
git commit -m "feat(react-native): add Text component"
```

---

## Task 4: Button (RN, TDD)

**Files:** Create `src/Button/Button.tsx`, `Button.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Button/Button.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button (RN)", () => {
  it("renders its label", () => {
    render(<Button onPress={() => {}}>Click</Button>);
    expect(screen.getByText("Click")).toBeInTheDocument();
  });

  it("calls onPress when pressed", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Go</Button>);
    fireEvent.click(screen.getByText("Go"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} disabled>
        Go
      </Button>,
    );
    fireEvent.click(screen.getByText("Go"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Button/Button.tsx`**

```tsx
import { Pressable, Text as RNText, type PressableProps, type TextStyle } from "react-native";
import {
  ColorBrandPrimary,
  ColorBackgroundSubtle,
  ColorTextPrimary,
  ColorWhite,
  RadiusMd,
  Spacing3,
  Spacing4,
  Spacing6,
  FontSizeBody,
  FontWeightBold,
} from "@superbase/tokens/native";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const padFor: Record<ButtonSize, number> = { sm: Spacing3, md: Spacing4, lg: Spacing6 };
const heightFor: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const bg = variant === "primary" ? ColorBrandPrimary : ColorBackgroundSubtle;
  const fg = variant === "primary" ? ColorWhite : ColorTextPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        {
          height: heightFor[size],
          paddingHorizontal: padFor[size],
          borderRadius: RadiusMd,
          backgroundColor: bg,
          opacity: disabled ? 0.4 : 1,
          alignItems: "center",
          justifyContent: "center",
        },
        style as object,
      ]}
      {...rest}
    >
      <RNText style={{ color: fg, fontSize: FontSizeBody, fontWeight: FontWeightBold as TextStyle["fontWeight"] }}>
        {children}
      </RNText>
    </Pressable>
  );
}
```

> 주: RNW에서 `Pressable`의 `onPress`는 클릭으로 트리거된다. `disabled`면 `onPress`가 호출되지 않아야 한다(RNW가 처리). fontWeight 캐스트는 Task 3과 동일하게 실제 타입에 맞춰 정리하라.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Button } from "./Button/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button/Button";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Button packages/react-native/src/index.ts
git commit -m "feat(react-native): add Button component"
```

---

## Task 5: TextField (RN, TDD)

**Files:** Create `src/TextField/TextField.tsx`, `TextField.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/TextField/TextField.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TextField } from "./TextField";

describe("TextField (RN)", () => {
  it("renders the label text", () => {
    render(<TextField label="이름" />);
    expect(screen.getByText("이름")).toBeInTheDocument();
  });

  it("calls onChangeText with the new value", () => {
    const onChangeText = vi.fn();
    render(<TextField label="이름" placeholder="입력" onChangeText={onChangeText} />);
    fireEvent.change(screen.getByPlaceholderText("입력"), { target: { value: "ab" } });
    expect(onChangeText).toHaveBeenCalledWith("ab");
  });

  it("renders an error message", () => {
    render(<TextField label="이메일" error="필수 항목" />);
    expect(screen.getByText("필수 항목")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/TextField/TextField.tsx`**

```tsx
import { View, Text as RNText, TextInput, type TextInputProps } from "react-native";
import {
  ColorTextPrimary,
  ColorTextSecondary,
  ColorBorderDefault,
  ColorRed500,
  RadiusMd,
  Spacing1,
  Spacing4,
  FontSizeBody,
  FontSizeCaption,
} from "@superbase/tokens/native";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={{ gap: Spacing1 }}>
      {label ? (
        <RNText style={{ fontSize: FontSizeCaption, color: ColorTextSecondary }}>
          {label}
        </RNText>
      ) : null}
      <TextInput
        style={[
          {
            height: 48,
            paddingHorizontal: Spacing4,
            borderWidth: 1,
            borderColor: error ? ColorRed500 : ColorBorderDefault,
            borderRadius: RadiusMd,
            fontSize: FontSizeBody,
            color: ColorTextPrimary,
          },
          style as object,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={{ fontSize: FontSizeCaption, color: ColorRed500 }}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
}
```

> 주: RN `TextInput`의 콜백은 `onChangeText(text: string)`이다(웹의 `onChange(value)`와 의미적으로 동일). RNW에서 `fireEvent.change`가 이를 트리거한다. `View`의 `gap`은 숫자(Spacing1)다.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { TextField } from "./TextField/TextField";
export type { TextFieldProps } from "./TextField/TextField";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/TextField packages/react-native/src/index.ts
git commit -m "feat(react-native): add TextField component"
```

---

## Task 6: Stack (RN, TDD)

**Files:** Create `src/Stack/Stack.tsx`, `Stack.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Stack/Stack.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { Stack } from "./Stack";

describe("Stack (RN)", () => {
  it("renders its children", () => {
    render(
      <Stack>
        <Text>child</Text>
      </Stack>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("accepts direction/gap/padding without error", () => {
    render(
      <Stack direction="row" gap={4} padding={2}>
        <Text>x</Text>
      </Stack>,
    );
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Stack/Stack.tsx`**

```tsx
import { View, type ViewProps, type FlexStyle } from "react-native";
import {
  Spacing1,
  Spacing2,
  Spacing3,
  Spacing4,
  Spacing6,
  Spacing8,
} from "@superbase/tokens/native";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
}

const SPACING: Record<SpacingScale, number> = {
  0: 0,
  1: Spacing1,
  2: Spacing2,
  3: Spacing3,
  4: Spacing4,
  6: Spacing6,
  8: Spacing8,
};

export function Stack({
  direction = "column",
  gap = 0,
  padding = 0,
  align,
  justify,
  style,
  ...rest
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: SPACING[gap],
          padding: SPACING[padding],
          alignItems: align,
          justifyContent: justify,
        },
        style as object,
      ]}
      {...rest}
    />
  );
}
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Stack } from "./Stack/Stack";
export type { StackProps, SpacingScale } from "./Stack/Stack";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Stack packages/react-native/src/index.ts
git commit -m "feat(react-native): add Stack layout component"
```

---

## Task 7: Switch (RN, TDD)

**Files:** Create `src/Switch/Switch.tsx`, `Switch.test.tsx`; Modify `src/index.ts`

- [ ] **Step 1: 실패 테스트 — `src/Switch/Switch.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch (RN)", () => {
  it("renders a switch reflecting checked state", () => {
    render(<Switch checked onChange={() => {}} accessibilityLabel="wifi" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("calls onChange with the toggled value", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} accessibilityLabel="wifi" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/react-native test` → FAIL.

- [ ] **Step 3: `src/Switch/Switch.tsx`**

```tsx
import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from "react-native";
import { ColorBrandPrimary, ColorGray200 } from "@superbase/tokens/native";

export interface SwitchProps
  extends Omit<RNSwitchProps, "value" | "onValueChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: ColorGray200, true: ColorBrandPrimary }}
      {...rest}
    />
  );
}
```

> 주: RN `Switch`는 `value`/`onValueChange` API다. 우리 컴포넌트는 `checked`/`onChange`로 래핑해 `@superbase/react`와 의미를 맞춘다. RNW의 `Switch`는 `role="switch"` + checked 상태를 렌더하며 클릭 시 `onValueChange`를 호출한다.

검증/적응: RNW의 Switch가 `getByRole("switch")`/`toBeChecked()`로 잡히는지 확인. 만약 RNW Switch가 다른 role(예: checkbox)로 렌더되면 테스트의 role을 실제 출력에 맞추되(예: `getByRole("checkbox")`), 토글 동작(onChange(true)) 검증은 유지하라. 무엇을 바꿨는지 보고하라.

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/react-native test` → PASS.

- [ ] **Step 5: `src/index.ts` 끝에 추가**

```ts
export { Switch } from "./Switch/Switch";
export type { SwitchProps } from "./Switch/Switch";
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/react-native typecheck` → exit 0.
```bash
git add packages/react-native/src/Switch packages/react-native/src/index.ts
git commit -m "feat(react-native): add Switch component"
```

---

## Task 8: tsc 빌드 검증 + README + 전체 검증

**Files:** Create `packages/react-native/README.md`

- [ ] **Step 1: 라이브러리 빌드**

Run: `pnpm --filter @superbase/react-native build`
Expected: `tsc -p tsconfig.build.json`가 `dist/index.js` + `dist/index.d.ts` 및 컴포넌트별 js/d.ts를 방출. 빌드 성공(exit 0).
검증: `ls packages/react-native/dist/index.js packages/react-native/dist/index.d.ts` 존재.

검증/적응: emit된 `dist`의 import 경로가 `react-native`(별칭 아님)와 `@superbase/tokens/native`로 남아 있는지 확인(`grep -r "react-native-web" packages/react-native/dist` 결과가 비어야 한다 — paths 별칭이 emit을 바꾸면 안 됨). 만약 `react-native-web`이 emit에 새어나오면 보고하고 paths 설정을 점검하라.

- [ ] **Step 2: `packages/react-native/README.md`**

```markdown
# @superbase/react-native

React Native용 컴포넌트. `@superbase/react`와 동일한 컴포넌트 API(Text/Button/TextField/Stack/Switch)를 제공하며 `@superbase/tokens`의 native 토큰을 소비한다.

## 사용

    import { Button, Text } from "@superbase/react-native";

`react-native`은 peerDependency다(앱이 제공). 토큰은 native 값(숫자 단위)으로 빌드되어 RN 스타일에 직접 쓰인다.

## 테스트

시뮬레이터 없이 `react-native-web` + jsdom으로 헤드리스 단위 테스트한다:

    pnpm --filter @superbase/react-native test

## v1 한계

- native 토큰의 light 값만 사용(정적). RN 다크 테마(런타임 ThemeProvider)는 v2 과제.
```

- [ ] **Step 3: 전체 모노레포 검증**

Run: `pnpm turbo run typecheck test build`
Expected: tokens·react·docs·react-native 전부 통과. react-native: 스모크 1 + 컴포넌트 테스트(2+3+3+2+2=12) = 13 테스트 통과(실제 수는 보고).

- [ ] **Step 4: Commit**

```bash
git add packages/react-native/README.md
git commit -m "docs(react-native): add README and verify tsc build"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 4개 워크스페이스(tokens·react·docs·react-native) 전부 통과한다.
- `@superbase/react-native`가 Text, Button, TextField, Stack, Switch를 `@superbase/react`와 동일한 prop 의미로 export한다.
- RN 컴포넌트가 `@superbase/tokens/native`의 숫자 단위 토큰을 소비한다.
- `@superbase/tokens`의 native 출력이 RN 친화적(숫자 크기) js + d.ts이고 `exports["./native"]`가 이를 가리킨다(I-2 해결).
- 시뮬레이터 없이 react-native-web로 컴포넌트가 헤드리스 테스트된다.

## 이후 (v2 후보, 이 플랜 범위 밖)

- RN 런타임 다크 테마(ThemeProvider + native 다크 토큰).
- vite 6 정합(vitest v3 업그레이드 후 핀 제거).
- 정식 npm 배포 자동화(Changesets).
- 추가 컴포넌트(Modal, Toast, Select, 아이콘 세트).
