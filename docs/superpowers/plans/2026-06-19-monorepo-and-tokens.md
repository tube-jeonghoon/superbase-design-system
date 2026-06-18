# Plan 1 — 모노레포 스캐폴드 + 토큰 패키지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pnpm + Turborepo 모노레포를 세우고, 디자인 토큰을 단일 소스(JSON)에서 정의해 웹용 CSS 변수와 모바일용 TS 토큰을 빌드하는 `@superbase/tokens` 패키지를 만든다.

**Architecture:** 루트는 pnpm workspace + Turborepo로 태스크를 오케스트레이션한다. `packages/tokens`는 primitive/semantic 2단 토큰 JSON을 Style Dictionary v4로 빌드해 `dist/web/variables.css`(light `:root` + dark `[data-theme="dark"]`)와 `dist/native/tokens.ts`(named export 상수)를 생성한다. 컴포넌트는 추후 semantic 토큰만 참조한다.

**Tech Stack:** pnpm 10, Turborepo, TypeScript 5, Style Dictionary 4, Vitest (스냅샷 테스트). Node 22.

> 전제: 작업 디렉토리는 `/Users/jeonjeonghoon/Documents/Personal/Projects/design-library` 이며 이미 git 초기화되어 있고 `.gitignore`(node_modules/, dist/, .next/, .turbo/)가 존재한다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `package.json` (root) | 워크스페이스 루트, devDependencies(turbo), 스크립트 |
| `pnpm-workspace.yaml` | `packages/*`, `apps/*` 워크스페이스 선언 |
| `turbo.json` | `build`/`test` 태스크 파이프라인 정의 |
| `tsconfig.base.json` | 공통 TS 컴파일러 옵션 |
| `packages/tokens/package.json` | 토큰 패키지 메타 + 빌드 스크립트 |
| `packages/tokens/tsconfig.json` | tokens 패키지 TS 설정 |
| `packages/tokens/src/primitives.json` | 원시 토큰 (color/spacing/radius/font) |
| `packages/tokens/src/semantic.light.json` | light 테마 semantic 토큰 |
| `packages/tokens/src/semantic.dark.json` | dark 테마 semantic 토큰 |
| `packages/tokens/style-dictionary.config.mjs` | Style Dictionary 빌드 설정 |
| `packages/tokens/build.mjs` | 빌드 진입점 (config 실행) |
| `packages/tokens/test/build.test.ts` | 빌드 산출물 스냅샷 테스트 |
| `packages/tokens/vitest.config.ts` | Vitest 설정 |

---

## Task 1: 모노레포 루트 스캐폴드

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`

- [ ] **Step 1: 루트 `package.json` 작성**

Create `package.json`:

```json
{
  "name": "superbase-design-system",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@10.27.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: `pnpm-workspace.yaml` 작성**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: `turbo.json` 작성**

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

- [ ] **Step 4: `tsconfig.base.json` 작성**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 5: 의존성 설치 후 turbo 동작 확인**

Run: `pnpm install`
Expected: `node_modules/` 생성, 에러 없음.

Run: `pnpm turbo run build`
Expected: "No tasks were executed" 류 메시지 (아직 빌드할 패키지 없음). 에러 없이 종료.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json pnpm-lock.yaml
git commit -m "chore: scaffold pnpm + turborepo monorepo root"
```

---

## Task 2: 토큰 패키지 스캐폴드 + 원시(primitive) 토큰

**Files:**
- Create: `packages/tokens/package.json`
- Create: `packages/tokens/tsconfig.json`
- Create: `packages/tokens/src/primitives.json`

- [ ] **Step 1: `packages/tokens/package.json` 작성**

Create `packages/tokens/package.json`:

```json
{
  "name": "@superbase/tokens",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    "./css": "./dist/web/variables.css",
    "./native": "./dist/native/tokens.ts"
  },
  "files": ["dist"],
  "scripts": {
    "build": "node build.mjs",
    "test": "vitest run"
  },
  "devDependencies": {
    "style-dictionary": "^4.3.0",
    "vitest": "^2.1.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: `packages/tokens/tsconfig.json` 작성**

Create `packages/tokens/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "test", "build.mjs", "style-dictionary.config.mjs"]
}
```

- [ ] **Step 3: 원시 토큰 `src/primitives.json` 작성**

Create `packages/tokens/src/primitives.json`:

```json
{
  "color": {
    "blue":  { "500": { "value": "#3182f6" }, "600": { "value": "#2272eb" } },
    "gray":  {
      "50":  { "value": "#f9fafb" },
      "100": { "value": "#f2f4f6" },
      "200": { "value": "#e5e8eb" },
      "400": { "value": "#b0b8c1" },
      "600": { "value": "#6b7684" },
      "800": { "value": "#333d4b" },
      "900": { "value": "#191f28" }
    },
    "white": { "value": "#ffffff" },
    "black": { "value": "#000000" },
    "red":   { "500": { "value": "#f04452" } }
  },
  "spacing": {
    "0": { "value": "0" },
    "1": { "value": "4px" },
    "2": { "value": "8px" },
    "3": { "value": "12px" },
    "4": { "value": "16px" },
    "6": { "value": "24px" },
    "8": { "value": "32px" }
  },
  "radius": {
    "sm": { "value": "8px" },
    "md": { "value": "12px" },
    "lg": { "value": "16px" },
    "full": { "value": "9999px" }
  },
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
  }
}
```

- [ ] **Step 4: 패키지 의존성 설치**

Run: `pnpm install`
Expected: `@superbase/tokens`의 devDependencies가 설치됨, 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/package.json packages/tokens/tsconfig.json packages/tokens/src/primitives.json pnpm-lock.yaml
git commit -m "feat(tokens): scaffold tokens package with primitive tokens"
```

---

## Task 3: Style Dictionary 빌드 — 웹 CSS 변수 (primitives만, 실패 테스트 먼저)

**Files:**
- Create: `packages/tokens/style-dictionary.config.mjs`
- Create: `packages/tokens/build.mjs`
- Create: `packages/tokens/vitest.config.ts`
- Test: `packages/tokens/test/build.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `packages/tokens/test/build.test.ts`:

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

describe("token build outputs", () => {
  it("creates web CSS variables file", () => {
    const cssPath = join(pkgRoot, "dist/web/variables.css");
    expect(existsSync(cssPath)).toBe(true);
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("--color-blue-500: #3182f6;");
    expect(css).toContain(":root");
  });
});
```

- [ ] **Step 2: Vitest 설정 작성**

Create `packages/tokens/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 30000
  }
});
```

- [ ] **Step 3: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — `build.mjs`가 없어 `execSync`가 에러를 던지거나 CSS 파일이 없음.

- [ ] **Step 4: Style Dictionary 설정 작성 (primitives → CSS)**

Create `packages/tokens/style-dictionary.config.mjs`:

```js
export default {
  source: ["src/primitives.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/web/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables"
        }
      ]
    }
  }
};
```

- [ ] **Step 5: 빌드 진입점 작성**

Create `packages/tokens/build.mjs`:

```js
import StyleDictionary from "style-dictionary";
import config from "./style-dictionary.config.mjs";

const sd = new StyleDictionary(config);
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
```

- [ ] **Step 6: 테스트 실행해 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — `dist/web/variables.css`에 `:root`와 `--color-blue-500: #3182f6;` 포함.

- [ ] **Step 7: Commit**

```bash
git add packages/tokens/style-dictionary.config.mjs packages/tokens/build.mjs packages/tokens/vitest.config.ts packages/tokens/test/build.test.ts
git commit -m "feat(tokens): build web CSS variables from primitive tokens"
```

---

## Task 4: 모바일용 TS 토큰 산출물 추가

**Files:**
- Modify: `packages/tokens/style-dictionary.config.mjs`
- Test: `packages/tokens/test/build.test.ts:` (테스트 추가)

- [ ] **Step 1: 실패하는 테스트 추가**

`packages/tokens/test/build.test.ts`의 `describe` 블록 안, 기존 `it(...)` 다음에 아래 테스트를 추가한다:

```ts
  it("creates native TS tokens file with named exports", () => {
    const tsPath = join(pkgRoot, "dist/native/tokens.ts");
    expect(existsSync(tsPath)).toBe(true);
    const ts = readFileSync(tsPath, "utf8");
    expect(ts).toContain("export const ColorBlue500 = \"#3182f6\";");
  });
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — `dist/native/tokens.ts`가 존재하지 않음.

- [ ] **Step 3: `native` 플랫폼을 config에 추가**

`packages/tokens/style-dictionary.config.mjs`의 `platforms` 객체에 `css` 다음으로 아래를 추가한다:

```js
    native: {
      transformGroup: "js",
      buildPath: "dist/native/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6"
        }
      ]
    }
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — `dist/native/tokens.ts`에 `export const ColorBlue500 = "#3182f6";` 포함.

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/style-dictionary.config.mjs packages/tokens/test/build.test.ts
git commit -m "feat(tokens): build native TS tokens from primitives"
```

---

## Task 5: Semantic 토큰 (light) + CSS `:root` 매핑

**Files:**
- Create: `packages/tokens/src/semantic.light.json`
- Modify: `packages/tokens/style-dictionary.config.mjs`
- Test: `packages/tokens/test/build.test.ts:` (테스트 추가)

- [ ] **Step 1: 실패하는 테스트 추가**

`build.test.ts`의 `describe` 블록 안에 아래 테스트를 추가한다:

```ts
  it("maps semantic tokens to resolved values in :root (light)", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain("--color-text-primary: #191f28;");
    expect(css).toContain("--color-background-default: #ffffff;");
  });
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — semantic 토큰이 아직 없음.

- [ ] **Step 3: light semantic 토큰 작성**

Create `packages/tokens/src/semantic.light.json`:

```json
{
  "color": {
    "text": {
      "primary":   { "value": "{color.gray.900}" },
      "secondary": { "value": "{color.gray.600}" },
      "disabled":  { "value": "{color.gray.400}" }
    },
    "background": {
      "default": { "value": "{color.white}" },
      "subtle":  { "value": "{color.gray.50}" }
    },
    "brand": {
      "primary": { "value": "{color.blue.500}" },
      "pressed": { "value": "{color.blue.600}" }
    },
    "border": {
      "default": { "value": "{color.gray.200}" }
    }
  }
}
```

- [ ] **Step 4: config의 css source에 semantic.light 추가**

`packages/tokens/style-dictionary.config.mjs`의 최상단 `source` 배열을 아래로 교체한다:

```js
  source: ["src/primitives.json", "src/semantic.light.json"],
```

> `outputReferences`를 쓰지 않으므로 semantic 토큰은 참조가 해석된 실제 hex로 출력된다 (`--color-text-primary: #191f28;` = gray.900, `--color-background-default: #ffffff;` = white). 이로써 Task 6에서 dark 블록을 같은 hex 방식으로 추가할 때 일관성이 유지된다.

- [ ] **Step 5: 테스트 실행해 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — `:root`에 semantic 토큰이 해석된 hex 값으로 출력됨.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/semantic.light.json packages/tokens/style-dictionary.config.mjs packages/tokens/test/build.test.ts
git commit -m "feat(tokens): add light semantic tokens to CSS output"
```

---

## Task 6: Dark 테마 — `[data-theme="dark"]` 블록 추가

**Files:**
- Create: `packages/tokens/src/semantic.dark.json`
- Modify: `packages/tokens/build.mjs`
- Modify: `packages/tokens/style-dictionary.config.mjs`
- Test: `packages/tokens/test/build.test.ts:` (테스트 추가)

> 접근: light는 `:root`로, dark는 `[data-theme="dark"]` selector로 같은 `variables.css`에 append한다. Style Dictionary를 두 번(라이트/다크 semantic을 각각 primitives와 합쳐) 빌드하되, dark 빌드는 `css/variables` 포맷의 `selector` 옵션으로 `[data-theme="dark"]`를 쓰고 결과를 light 파일 뒤에 이어붙인다.

- [ ] **Step 1: 실패하는 테스트 추가**

`build.test.ts`의 `describe` 블록 안에 아래 테스트를 추가한다:

```ts
  it("emits a dark theme block overriding semantic tokens", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--color-background-default: #191f28;");
  });
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: FAIL — dark 블록 없음.

- [ ] **Step 3: dark semantic 토큰 작성**

Create `packages/tokens/src/semantic.dark.json`:

```json
{
  "color": {
    "text": {
      "primary":   { "value": "{color.gray.50}" },
      "secondary": { "value": "{color.gray.400}" },
      "disabled":  { "value": "{color.gray.600}" }
    },
    "background": {
      "default": { "value": "{color.gray.900}" },
      "subtle":  { "value": "{color.gray.800}" }
    },
    "brand": {
      "primary": { "value": "{color.blue.500}" },
      "pressed": { "value": "{color.blue.600}" }
    },
    "border": {
      "default": { "value": "{color.gray.800}" }
    }
  }
}
```

- [ ] **Step 4: config를 named export 두 개(light/dark)로 분리**

Replace `packages/tokens/style-dictionary.config.mjs` 전체 내용:

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

export const lightConfig = {
  source: ["src/primitives.json", "src/semantic.light.json"],
  platforms: {
    css: cssFile(":root"),
    native: {
      transformGroup: "js",
      buildPath: "dist/native/",
      files: [{ destination: "tokens.ts", format: "javascript/es6" }]
    }
  }
};

export const darkConfig = {
  source: ["src/primitives.json", "src/semantic.dark.json"],
  platforms: {
    css: cssFile('[data-theme="dark"]')
  }
};
```

> `outputReferences: false`로 두어 dark 블록에서 semantic 값이 실제 hex로 출력되게 한다 (Step 1 테스트의 `#191f28` 기대값과 일치). light 블록도 hex로 출력된다.

- [ ] **Step 5: build.mjs를 두 단계 빌드 + 병합으로 교체**

Replace `packages/tokens/build.mjs` 전체 내용:

```js
import StyleDictionary from "style-dictionary";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";

rmSync("dist", { recursive: true, force: true });

// 1) light(:root) + native TS
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync("dist/web/variables.css", "utf8");

// 2) dark([data-theme="dark"]) — 같은 파일을 덮어쓰므로 따로 읽어 병합
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync("dist/web/variables.css", "utf8");

// 3) light 뒤에 dark 블록을 이어붙여 최종 파일로 기록
writeFileSync("dist/web/variables.css", `${lightCss}\n${darkCss}`);
```

- [ ] **Step 6: 테스트 실행해 통과 확인**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — 모든 테스트 통과. `variables.css`에 `:root {...}` 블록과 `[data-theme="dark"] {...}` 블록이 모두 존재하고, dark 블록의 `--color-background-default: #191f28;` 포함.

- [ ] **Step 7: 전체 빌드/테스트 turbo로 확인**

Run: `pnpm turbo run test`
Expected: `@superbase/tokens#build` → `@superbase/tokens#test` 순서로 실행되어 PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/tokens/src/semantic.dark.json packages/tokens/style-dictionary.config.mjs packages/tokens/build.mjs packages/tokens/test/build.test.ts
git commit -m "feat(tokens): add dark theme block to CSS output"
```

---

## Task 7: README + 산출물 스냅샷 고정

**Files:**
- Create: `packages/tokens/README.md`
- Test: `packages/tokens/test/build.test.ts:` (스냅샷 테스트 추가)

- [ ] **Step 1: 스냅샷 테스트 추가**

`build.test.ts`의 `describe` 블록 안에 아래 테스트를 추가한다:

```ts
  it("matches the CSS output snapshot", () => {
    const css = readFileSync(join(pkgRoot, "dist/web/variables.css"), "utf8");
    expect(css).toMatchSnapshot();
  });

  it("matches the native TS output snapshot", () => {
    const ts = readFileSync(join(pkgRoot, "dist/native/tokens.ts"), "utf8");
    expect(ts).toMatchSnapshot();
  });
```

- [ ] **Step 2: 테스트 실행해 스냅샷 생성**

Run: `pnpm --filter @superbase/tokens test`
Expected: PASS — `test/__snapshots__/build.test.ts.snap` 생성됨. 이후 토큰 변경 시 의도치 않은 산출물 변화가 잡힌다.

- [ ] **Step 3: README 작성**

Create `packages/tokens/README.md`:

```markdown
# @superbase/tokens

디자인 토큰 단일 소스. `src/*.json`을 Style Dictionary로 빌드해 플랫폼별 산출물을 생성한다.

## 빌드

    pnpm --filter @superbase/tokens build

## 산출물

- `dist/web/variables.css` — CSS 변수. `:root`(light) + `[data-theme="dark"]`(dark).
- `dist/native/tokens.ts` — RN용 named export 상수.

## 토큰 구조

- `src/primitives.json` — 원시값 (color/spacing/radius/font)
- `src/semantic.light.json`, `src/semantic.dark.json` — 의미 기반 토큰. 컴포넌트는 semantic만 참조한다.
```

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/README.md packages/tokens/test/build.test.ts packages/tokens/test/__snapshots__
git commit -m "test(tokens): snapshot build outputs + add README"
```

---

## 완료 기준 (Definition of Done)

- `pnpm install` → `pnpm turbo run test` 가 에러 없이 통과한다.
- `packages/tokens/dist/web/variables.css` 에 light `:root` 와 dark `[data-theme="dark"]` 블록이 존재한다.
- `packages/tokens/dist/native/tokens.ts` 에 named export 토큰 상수가 존재한다.
- semantic 토큰(`color.text.primary` 등)이 양쪽 산출물에 반영된다.
- 스냅샷 테스트가 산출물을 고정한다.

## 다음 플랜

- **Plan 2**: `@superbase/react`(웹 컴포넌트, CSS Modules + 토큰 CSS 변수) + `apps/docs`(Next.js 커스텀 문서 사이트).
- **Plan 3**: `@superbase/react-native`(동일 API 모바일 컴포넌트, 토큰 TS 소비).
