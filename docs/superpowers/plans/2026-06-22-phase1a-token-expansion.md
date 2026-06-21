# Plan 1a — 토큰 확장 + 빌드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 디자인 시스템에 빠진 파운데이션 토큰(shadow·motion·focus-ring·opacity·border-width·z-index·line-height·letter-spacing) + component-size 토큰을 단일 JSON 소스에 추가하고, 웹 CSS 변수와 RN 런타임 테마 객체(`lightTheme`/`darkTheme`)로 빌드한다.

**Architecture:** 기존 Style Dictionary 파이프라인을 확장한다. 단순 스칼라 토큰은 JSON 소스에 추가해 SD가 web CSS + native flat 상수로 emit한다. 합성(shadow)은 SD 외부 `src/shadows.mjs` 단일소스로 정의해 build.mjs가 (a) web CSS 변수 append, (b) RN 테마에 주입한다. RN 런타임 테마 객체는 SD가 `json/nested` 산출물을 내고 build.mjs가 그걸 읽어 값 변환(`120ms`→120, `cubic-bezier(...)`→튜플 등) 후 `dist/native/theme.js`/`theme.d.ts`로 조립한다. 웹 전용 토큰(focus-ring·z-index·letter-spacing)은 RN 테마에서 제외한다.

**Tech Stack:** Style Dictionary 4, Node 22 ESM, Vitest, pnpm workspace. 변경 패키지: `packages/tokens`만.

> **이 플랜은 `packages/tokens`에만 손댄다.** 컴포넌트(react/react-native) 적용은 Plan 1b·1c.
> 모든 명령은 레포 루트에서 `pnpm --filter @superbase/tokens ...` 또는 `packages/tokens`에서 `node build.mjs`.
> CSS 변수 이름은 SD `name/kebab`(lodash kebabCase) 규칙: `borderWidth`→`--border-width-*`, `lineHeight`→`--line-height-*`, `zIndex`→`--z-index-*`, `focusRing`→`--focus-ring-*`.

---

## Task 1: 스칼라 파운데이션 토큰을 primitives.json에 추가

**Files:**
- Modify: `packages/tokens/src/primitives.json`
- Test: `packages/tokens/test/build.test.ts`

신규 토큰: `borderWidth`, `opacity`, `lineHeight`, `letterSpacing`, `duration`, `easing`, `zIndex`, `focusRing`. SD가 web CSS + native flat 상수로 자동 emit한다.

- [ ] **Step 1: 실패 테스트 추가**

`packages/tokens/test/build.test.ts`의 마지막 `it("matches the CSS output snapshot"...)` **앞에** 아래 블록을 추가:

```ts
  it("emits scalar foundation tokens as CSS variables", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--border-width-thin: 1px;");
    expect(css).toContain("--border-width-medium: 2px;");
    expect(css).toContain("--opacity-disabled: 0.4;");
    expect(css).toContain("--opacity-pressed: 0.85;");
    expect(css).toContain("--line-height-body: 1.5;");
    expect(css).toContain("--letter-spacing-tight: -0.02em;");
    expect(css).toContain("--duration-fast: 120ms;");
    expect(css).toContain("--duration-slow: 320ms;");
    expect(css).toContain("--easing-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(css).toContain("--z-index-modal: 1300;");
    expect(css).toContain("--focus-ring-color: rgba(49, 130, 246, 0.4);");
    expect(css).toContain("--focus-ring-width: 2px;");
  });
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — "emits scalar foundation tokens" 케이스가 `--border-width-thin` 미존재로 실패.

- [ ] **Step 3: primitives.json에 토큰 추가**

`packages/tokens/src/primitives.json`에서 마지막 `"font": {...}` 블록 **뒤에** (닫는 `}` 직전) 아래를 추가. `font` 블록 끝의 `}` 뒤에 콤마를 넣는 것에 유의:

```json
  "font": {
    "size": {
      "caption": { "value": "13px" },
      "body":    { "value": "15px" },
      "title":   { "value": "20px" },
      "display": { "value": "28px" }
    },
    "weight": {
      "regular": { "value": "400" },
      "medium":  { "value": "500" },
      "bold":    { "value": "700" }
    }
  },
  "borderWidth": {
    "thin":   { "value": "1px" },
    "medium": { "value": "2px" }
  },
  "opacity": {
    "disabled": { "value": "0.4" },
    "pressed":  { "value": "0.85" }
  },
  "lineHeight": {
    "caption": { "value": "1.4" },
    "body":    { "value": "1.5" },
    "title":   { "value": "1.4" },
    "display": { "value": "1.3" }
  },
  "letterSpacing": {
    "tight":  { "value": "-0.02em" },
    "normal": { "value": "0" }
  },
  "duration": {
    "fast": { "value": "120ms" },
    "base": { "value": "200ms" },
    "slow": { "value": "320ms" }
  },
  "easing": {
    "standard":   { "value": "cubic-bezier(0.2, 0, 0, 1)" },
    "decelerate": { "value": "cubic-bezier(0, 0, 0, 1)" },
    "accelerate": { "value": "cubic-bezier(0.3, 0, 1, 1)" }
  },
  "zIndex": {
    "dropdown": { "value": "1000" },
    "overlay":  { "value": "1200" },
    "modal":    { "value": "1300" },
    "popover":  { "value": "1400" },
    "toast":    { "value": "1500" }
  },
  "focusRing": {
    "color":  { "value": "rgba(49, 130, 246, 0.4)" },
    "width":  { "value": "2px" },
    "offset": { "value": "2px" }
  }
```

> 즉, 기존 `"font": { ... }` 다음에 콤마를 추가하고 위 8개 카테고리를 이어 붙인 뒤 파일을 닫는다.

- [ ] **Step 4: 테스트 통과 + 스냅샷 갱신**

기존 CSS/native 스냅샷이 신규 토큰으로 바뀌므로 스냅샷을 갱신한다.
Run: `pnpm --filter @superbase/tokens test -- -u`
Expected: PASS (7→8 케이스, 스냅샷 2개 갱신: variables.css, tokens.js).

> 확인: native flat 상수에도 `BorderWidthThin`, `OpacityDisabled`, `DurationFast`, `EasingStandard` 등이 추가됨(스냅샷에 반영). 이 flat 상수의 string/number 형태는 Plan 1b에서 쓰지 않고, RN은 Task 4의 테마 객체를 쓴다.

- [ ] **Step 5: 커밋**

```bash
git add packages/tokens/src/primitives.json packages/tokens/test/build.test.ts packages/tokens/test/__snapshots__
git commit -m "feat(tokens): add scalar foundation tokens (border-width, opacity, motion, focus-ring, z-index, line-height, letter-spacing)"
```

---

## Task 2: component-size 토큰 (sizing.json)

**Files:**
- Create: `packages/tokens/src/sizing.json`
- Modify: `packages/tokens/style-dictionary.config.mjs` (소스 배열에 sizing.json 추가)
- Test: `packages/tokens/test/build.test.ts`

하드코딩 치수(버튼 높이·컨트롤 박스·필드 높이·스위치·아이콘)를 토큰화한다.

- [ ] **Step 1: 실패 테스트 추가**

`build.test.ts`의 snapshot 케이스들 앞에 추가:

```ts
  it("emits component-size tokens (web + native)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--size-control: 20px;");
    expect(css).toContain("--size-button-md: 44px;");
    expect(css).toContain("--size-field: 48px;");
    expect(css).toContain("--size-switch-thumb: 28px;");
    expect(css).toContain("--size-icon-md: 20px;");
    const js = readFileSync(join(pkgRoot, "dist/native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeControl = 20;");
    expect(js).toContain("export const SizeButtonMd = 44;");
  });
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — `--size-control` 미존재.

- [ ] **Step 3: sizing.json 생성**

Create `packages/tokens/src/sizing.json`:

```json
{
  "size": {
    "control": { "value": "20px" },
    "field":   { "value": "48px" },
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
    "icon": {
      "sm": { "value": "16px" },
      "md": { "value": "20px" },
      "lg": { "value": "24px" }
    }
  }
}
```

- [ ] **Step 4: 소스 배열에 추가**

`packages/tokens/style-dictionary.config.mjs`의 `lightConfig.source`와 `darkConfig.source` **둘 다**에 `"src/sizing.json"`을 추가:

```js
export const lightConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.light.json"],
  // ...
};

export const darkConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.dark.json"],
  // ...
};
```

> `size`는 색이 아니므로 light/dark 동일하게 들어가도 무해(다크 CSS 블록에도 동일 `--size-*`가 중복되지만 값이 같아 무해 — 기존 primitive 중복과 동일 패턴).

- [ ] **Step 5: 테스트 통과 + 스냅샷 갱신**

Run: `pnpm --filter @superbase/tokens test -- -u`
Expected: PASS. `--size-*` 변수와 `SizeControl = 20` 등 native 상수 확인, 스냅샷 갱신.

- [ ] **Step 6: 커밋**

```bash
git add packages/tokens/src/sizing.json packages/tokens/style-dictionary.config.mjs packages/tokens/test/build.test.ts packages/tokens/test/__snapshots__
git commit -m "feat(tokens): add component-size tokens (control, button, field, switch, icon)"
```

---

## Task 3: shadow 토큰 (shadows.mjs + web CSS 주입)

**Files:**
- Create: `packages/tokens/src/shadows.mjs`
- Modify: `packages/tokens/build.mjs`
- Test: `packages/tokens/test/build.test.ts`

shadow는 web `box-shadow` 문자열과 RN 객체 형태가 달라 SD 밖 단일소스로 정의한다. 이 태스크는 web CSS 주입까지. RN 테마 주입은 Task 4.

- [ ] **Step 1: 실패 테스트 추가**

`build.test.ts` snapshot 케이스 앞에 추가:

```ts
  it("emits elevation/shadow CSS variables", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);");
    expect(css).toContain("--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);");
    expect(css).toContain("--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);");
    expect(css).toContain("--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);");
  });
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — `--shadow-sm` 미존재.

- [ ] **Step 3: shadows.mjs 생성 (단일소스)**

Create `packages/tokens/src/shadows.mjs`:

```js
// Shadow 토큰 단일소스. web(box-shadow 문자열)과 RN(객체) 둘 다 여기서 파생.
export const shadows = {
  sm: { x: 0, y: 1, blur: 2, color: "rgba(0, 0, 0, 0.06)", opacity: 0.06, elevation: 1 },
  md: { x: 0, y: 4, blur: 8, color: "rgba(0, 0, 0, 0.08)", opacity: 0.08, elevation: 4 },
  lg: { x: 0, y: 8, blur: 24, color: "rgba(0, 0, 0, 0.12)", opacity: 0.12, elevation: 8 },
  xl: { x: 0, y: 16, blur: 48, color: "rgba(0, 0, 0, 0.16)", opacity: 0.16, elevation: 16 },
};

// web CSS 변수 블록 본문 (":root { ... }" 안에 들어갈 줄들)
export function shadowCssLines() {
  return Object.entries(shadows)
    .map(([k, s]) => `  --shadow-${k}: ${s.x} ${s.y}px ${s.blur}px ${s.color};`)
    .join("\n");
}

// RN 테마용 shadow 객체 (react-native style 형태)
export function shadowNativeObject() {
  const out = {};
  for (const [k, s] of Object.entries(shadows)) {
    out[k] = {
      shadowColor: "#000000",
      shadowOffset: { width: s.x, height: s.y },
      shadowOpacity: s.opacity,
      shadowRadius: s.blur,
      elevation: s.elevation,
    };
  }
  return out;
}
```

> 주: web box-shadow의 첫 offset-x는 `0`(단위 없는 0 허용), y/blur는 px.

- [ ] **Step 4: build.mjs에서 shadow CSS 주입**

`packages/tokens/build.mjs`를 아래로 교체 (기존 로직 유지 + shadow `:root` 블록을 light CSS 뒤·dark CSS 앞에 주입):

```js
import StyleDictionary from "style-dictionary";
StyleDictionary.registerTransform({
  name: "size/px-to-number",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof token.value === "string" && /^-?\d*\.?\d+px$/.test(token.value),
  transform: (token) => parseFloat(token.value),
});
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";
import { shadowCssLines } from "./src/shadows.mjs";

rmSync("dist", { recursive: true, force: true });

// 1) light(:root) + native TS
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync("dist/web/variables.css", "utf8");

// 2) dark([data-theme="dark"]) — overwrites variables.css, read separately
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync("dist/web/variables.css", "utf8");

// 3) shadow :root 블록 (SD 밖 단일소스)
const shadowBlock = `:root {\n${shadowCssLines()}\n}`;

// 4) light + shadow + dark 병합 후 최종 파일 작성
writeFileSync("dist/web/variables.css", `${lightCss}\n${shadowBlock}\n${darkCss}`);
```

- [ ] **Step 5: 테스트 통과 + 스냅샷 갱신**

Run: `pnpm --filter @superbase/tokens test -- -u`
Expected: PASS. `--shadow-*` 4개 존재, CSS 스냅샷 갱신.

- [ ] **Step 6: 커밋**

```bash
git add packages/tokens/src/shadows.mjs packages/tokens/build.mjs packages/tokens/test/build.test.ts packages/tokens/test/__snapshots__
git commit -m "feat(tokens): add elevation/shadow tokens (web box-shadow vars)"
```

---

## Task 4: RN 런타임 테마 객체 (lightTheme / darkTheme)

**Files:**
- Modify: `packages/tokens/style-dictionary.config.mjs` (light·dark에 `json/nested` 산출물 추가)
- Modify: `packages/tokens/build.mjs` (json 읽어 theme.js/theme.d.ts 생성)
- Modify: `packages/tokens/package.json` (`./native/theme` export 추가)
- Test: `packages/tokens/test/theme.test.ts` (신규)

SD가 light/dark의 해석된 토큰을 `json/nested`로 내고, build.mjs가 읽어 값 변환·재구조화 후 `dist/native/theme.js`(`lightTheme`/`darkTheme`)와 `theme.d.ts`(`Theme` 타입)를 생성한다. 웹 전용(`zIndex`/`focusRing`/`letterSpacing`)은 RN 테마에서 제외, `duration`/`easing`은 `motion` 아래로 묶고 shadow를 주입한다.

- [ ] **Step 1: 실패 테스트 추가 (신규 파일)**

Create `packages/tokens/test/theme.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pkgRoot = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");

beforeAll(() => {
  execSync("node build.mjs", { cwd: pkgRoot, stdio: "inherit" });
});

describe("native runtime theme objects", () => {
  it("writes theme.js and theme.d.ts", () => {
    expect(existsSync(join(pkgRoot, "dist/native/theme.js"))).toBe(true);
    expect(existsSync(join(pkgRoot, "dist/native/theme.d.ts"))).toBe(true);
  });

  it("lightTheme and darkTheme have the expected shared shape with converted values", async () => {
    const mod = await import(join(pkgRoot, "dist/native/theme.js"));
    const { lightTheme, darkTheme } = mod;
    // colors differ
    expect(lightTheme.color.text.primary).toBe("#191f28");
    expect(darkTheme.color.background.default).toBe("#191f28");
    // shared scalars converted to numbers
    expect(lightTheme.spacing["4"]).toBe(16);
    expect(lightTheme.radius.md).toBe(12);
    expect(lightTheme.font.size.body).toBe(15);
    expect(lightTheme.borderWidth.thin).toBe(1);
    expect(lightTheme.opacity.disabled).toBe(0.4);
    expect(lightTheme.lineHeight.body).toBe(1.5);
    // motion grouped + converted
    expect(lightTheme.motion.duration.fast).toBe(120);
    expect(lightTheme.motion.easing.standard).toEqual([0.2, 0, 0, 1]);
    // shadow injected as RN object
    expect(lightTheme.shadow.md.elevation).toBe(4);
    expect(lightTheme.shadow.md.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(lightTheme.shadow.md.shadowOpacity).toBe(0.08);
    // component sizes
    expect(lightTheme.size.button.md).toBe(44);
    expect(lightTheme.size.control).toBe(20);
    // web-only excluded from RN theme
    expect(lightTheme.zIndex).toBeUndefined();
    expect(lightTheme.focusRing).toBeUndefined();
    expect(lightTheme.letterSpacing).toBeUndefined();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — `dist/native/theme.js` 미존재.

- [ ] **Step 3: SD 설정에 json/nested 산출물 추가**

`packages/tokens/style-dictionary.config.mjs`를 아래로 교체(`nativeTransforms` 공통화 + light에 `tokens.light.json`, dark에 native json 플랫폼 추가):

```js
const cssFile = (selector) => ({
  transformGroup: "css",
  buildPath: "dist/web/",
  options: { outputReferences: false },
  files: [
    {
      destination: "variables.css",
      format: "css/variables",
      options: { selector }
    }
  ]
});

const nativeTransforms = ["attribute/cti", "name/pascal", "color/css", "size/px-to-number"];

export const lightConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.light.json"],
  platforms: {
    css: cssFile(":root"),
    native: {
      transforms: nativeTransforms,
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.d.ts", format: "typescript/es6-declarations" },
        { destination: "tokens.light.json", format: "json/nested" }
      ]
    }
  }
};

export const darkConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.dark.json"],
  platforms: {
    css: cssFile('[data-theme="dark"]'),
    native: {
      transforms: nativeTransforms,
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.dark.json", format: "json/nested" }
      ]
    }
  }
};
```

> `json/nested`는 SD v4 내장 포맷으로, 변환이 적용된 leaf `{ value }`를 가진 중첩 객체를 emit한다.

- [ ] **Step 4: build.mjs에서 theme.js/theme.d.ts 생성**

`packages/tokens/build.mjs`를 아래로 교체(Task 3 결과 + 테마 조립 추가). dark native 빌드가 `tokens.js`를 덮어쓰지 않도록 dark는 native json만 낸다(Step 3에서 보장). 단, dark의 css 빌드가 `variables.css`를 덮어쓰는 기존 동작은 유지되므로 **dark 빌드를 css 읽기 직후**에 처리한다:

```js
import StyleDictionary from "style-dictionary";
StyleDictionary.registerTransform({
  name: "size/px-to-number",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof token.value === "string" && /^-?\d*\.?\d+px$/.test(token.value),
  transform: (token) => parseFloat(token.value),
});
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";
import { shadowCssLines, shadowNativeObject } from "./src/shadows.mjs";

rmSync("dist", { recursive: true, force: true });

// 1) light: web :root + native flat + tokens.light.json
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync("dist/web/variables.css", "utf8");
const lightJson = JSON.parse(readFileSync("dist/native/tokens.light.json", "utf8"));

// 2) dark: web [data-theme] (overwrites variables.css) + tokens.dark.json
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync("dist/web/variables.css", "utf8");
const darkJson = JSON.parse(readFileSync("dist/native/tokens.dark.json", "utf8"));

// 3) shadow :root 블록 주입 후 최종 CSS 작성
const shadowBlock = `:root {\n${shadowCssLines()}\n}`;
writeFileSync("dist/web/variables.css", `${lightCss}\n${shadowBlock}\n${darkCss}`);

// 4) RN 테마 객체 조립
writeFileSync("dist/native/theme.js", themeModule(buildTheme(lightJson), buildTheme(darkJson)));
writeFileSync("dist/native/theme.d.ts", themeDts());

// --- helpers ---

// json/nested leaf 값 변환: "120ms"→120, cubic-bezier(...)→[..], 숫자문자열→number, 그 외 string 유지
function convertLeaf(v) {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return v;
  const s = v.trim();
  const bez = s.match(/^cubic-bezier\(([^)]+)\)$/);
  if (bez) return bez[1].split(",").map((n) => parseFloat(n.trim()));
  if (/^-?\d*\.?\d+ms$/.test(s)) return parseFloat(s);
  if (/^-?\d*\.?\d+$/.test(s)) return parseFloat(s);
  return s; // 색(hex/rgba), "-0.02em" 등은 문자열 유지
}

// json/nested 트리에서 { value } leaf를 변환값으로 치환한 순수 객체 생성.
// leaf 판별: token 객체는 `value` 키를 가지며 그 값은 원시값(string/number)이다.
function strip(node) {
  if (node && typeof node === "object" && "value" in node && typeof node.value !== "object") {
    return convertLeaf(node.value);
  }
  const out = {};
  for (const [k, child] of Object.entries(node)) out[k] = strip(child);
  return out;
}

// 테마 객체 재구조화: 웹전용 제거, motion 묶기, shadow 주입
function buildTheme(json) {
  const t = strip(json);
  const motion = { duration: t.duration, easing: t.easing };
  delete t.duration;
  delete t.easing;
  delete t.zIndex;
  delete t.focusRing;
  delete t.letterSpacing;
  t.motion = motion;
  t.shadow = shadowNativeObject();
  return t;
}

function themeModule(lightTheme, darkTheme) {
  return (
    "/** Do not edit directly, this file was auto-generated. */\n" +
    `export const lightTheme = ${JSON.stringify(lightTheme, null, 2)};\n\n` +
    `export const darkTheme = ${JSON.stringify(darkTheme, null, 2)};\n`
  );
}

function themeDts() {
  return `/** Do not edit directly, this file was auto-generated. */
export interface Theme {
  color: {
    text: { primary: string; secondary: string; disabled: string };
    background: { default: string; subtle: string };
    brand: { primary: string; pressed: string };
    border: { default: string };
    status: { info: string; success: string; warning: string; danger: string };
  };
  spacing: Record<"0" | "1" | "2" | "3" | "4" | "6" | "8", number>;
  radius: { sm: number; md: number; lg: number; full: number };
  font: {
    size: { caption: number; body: number; title: number; display: number };
    weight: { regular: number; medium: number; bold: number };
  };
  lineHeight: { caption: number; body: number; title: number; display: number };
  borderWidth: { thin: number; medium: number };
  opacity: { disabled: number; pressed: number };
  motion: {
    duration: { fast: number; base: number; slow: number };
    easing: {
      standard: [number, number, number, number];
      decelerate: [number, number, number, number];
      accelerate: [number, number, number, number];
    };
  };
  shadow: Record<"sm" | "md" | "lg" | "xl", {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }>;
  size: {
    control: number;
    field: number;
    button: { sm: number; md: number; lg: number };
    switch: { width: number; height: number; thumb: number };
    icon: { sm: number; md: number; lg: number };
  };
}
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export type ColorScheme = "light" | "dark";
`;
}
```

> `font.weight`는 source가 `"400"` 등 문자열이지만 `convertLeaf`가 숫자문자열을 number로 바꾼다 → `font.weight.bold === 700`(number). RN `fontWeight`는 string/number 모두 허용하나 number도 유효. RN Text 적용은 Plan 1b에서 `String(weight)` 처리.

- [ ] **Step 5: package.json에 export 추가**

`packages/tokens/package.json`의 `exports`에 `./native/theme`를 추가:

```json
  "exports": {
    "./css": "./dist/web/variables.css",
    "./native": {
      "types": "./dist/native/tokens.d.ts",
      "import": "./dist/native/tokens.js"
    },
    "./native/theme": {
      "types": "./dist/native/theme.d.ts",
      "import": "./dist/native/theme.js"
    }
  },
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — theme.test.ts 2 케이스 통과(특히 `motion.easing.standard` `[0.2,0,0,1]`, `shadow.md.elevation` 4, `zIndex`/`focusRing`/`letterSpacing` undefined). build.test.ts도 계속 통과.

> 검증/적응: 만약 `strip()`가 SD `json/nested`의 실제 leaf 형태와 안 맞아 `[object Object]`나 잘못된 중첩이 나오면, `node build.mjs` 후 `dist/native/tokens.light.json`을 열어 실제 leaf 모양(예: `{ "value": 16, "type": ... }` 또는 `{ "value": "16px" }`)을 확인하고 `strip()`의 leaf 판별을 그 모양에 맞춰 단순화하라. 의도: 각 leaf의 `.value`(변환 적용된 값)를 취해 중첩 순수 객체를 만든다.

- [ ] **Step 7: 커밋**

```bash
git add packages/tokens/style-dictionary.config.mjs packages/tokens/build.mjs packages/tokens/package.json packages/tokens/test/theme.test.ts
git commit -m "feat(tokens): emit RN runtime theme objects (lightTheme/darkTheme) with motion/shadow/size"
```

---

## Task 5: 최종 검증 + changeset

**Files:**
- Create: `.changeset/phase1a-tokens.md`

- [ ] **Step 1: 전체 빌드/타입체크/테스트**

Run: `pnpm turbo run typecheck test build --filter=@superbase/tokens`
Expected: 전부 통과.

- [ ] **Step 2: 다운스트림 영향 없음 확인(빌드)**

Run: `pnpm turbo run build`
Expected: 전 패키지 빌드 성공. tokens는 신규 추가만 했으므로 react/react-native/docs 빌드는 영향 없음(기존 export 불변, 신규 export만 추가).

- [ ] **Step 3: changeset 작성**

Create `.changeset/phase1a-tokens.md`:

```md
---
"@superbase/tokens": minor
---

파운데이션 토큰 확장: shadow/elevation, motion(duration·easing), focus-ring, opacity, border-width, z-index, line-height, letter-spacing, component-size 토큰 추가. RN용 런타임 테마 객체 `lightTheme`/`darkTheme`를 `@superbase/tokens/native/theme`로 export(기존 flat export·웹 CSS 변수는 하위호환 유지).
```

- [ ] **Step 4: 커밋**

```bash
git add .changeset/phase1a-tokens.md
git commit -m "chore(tokens): changeset for foundation token expansion"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build` 전부 통과.
- web `variables.css`에 신규 토큰 변수 전부 존재(border-width·opacity·line-height·letter-spacing·duration·easing·z-index·focus-ring·size·shadow).
- `@superbase/tokens/native/theme`가 `lightTheme`/`darkTheme`/`Theme`/`ColorScheme`를 export, 값이 올바른 형(숫자·easing 튜플·shadow 객체)으로 변환, 웹 전용 토큰은 제외.
- 기존 export(`./css`, `./native` flat 상수)·웹 CSS 구조 하위호환 유지 → react/react-native/docs 빌드 무영향.
- changeset로 `@superbase/tokens` minor 예약.

## 이후 (Plan 1b·1c에서)
- **Plan 1b**: `@superbase/react-native`에 `ThemeProvider`/`useTheme`(기본값 lightTheme) 추가, RN 10개 컴포넌트를 `useTheme()` 기반으로 전환 + `forwardRef` + `t.size.*`/`t.opacity.*`/`t.borderWidth.*` 적용, danger 색을 semantic으로.
- **Plan 1c**: `@superbase/react` 10개 컴포넌트 `forwardRef` + 하드코딩→`var(--…)` 교체 + `:focus-visible` focus-ring + Spinner 기본 aria-label 영문화.
- docs Foundations 페이지 신규 토큰 시각화는 1c 또는 별도 마무리 태스크.
