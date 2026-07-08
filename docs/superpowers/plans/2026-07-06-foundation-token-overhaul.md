# Foundation 토큰 개편 (그린 브랜드) 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/tokens`의 색 팔레트를 blue 브랜드에서 green 브랜드(+그린틴트 neutral, amber/blue 상태색)로 전면 교체하고, 문서 파운데이션 페이지를 새 팔레트에 맞춰 재작성한다.

**Architecture:** 컴포넌트는 색 primitive를 직접 참조하지 않고 전부 semantic 토큰(`--color-brand-primary` 등)을 경유하므로, primitives + semantic 매핑 + focusRing만 바꾸면 웹·RN 컴포넌트 코드 변경 없이 브랜드가 교체된다. style-dictionary 빌드 파이프라인은 HEX만 쓰므로 무변경. 문서 파운데이션 페이지의 Colors 탭만 새 팔레트 표시로 재작성하고 나머지 탭은 유지한다.

**Tech Stack:** JSON 토큰 소스, style-dictionary(build.mjs), Vitest(스냅샷 포함), Next.js(App Router) 문서 앱, pnpm + Turborepo, Changesets.

**참조 스펙:** `docs/superpowers/specs/2026-07-06-foundation-token-overhaul-design.md`

---

## 파일 구조

- 수정: `packages/tokens/src/primitives.json` — 색 그룹 전면 교체 + focusRing.color
- 수정: `packages/tokens/src/semantic.light.json` — 시맨틱 remap
- 수정: `packages/tokens/src/semantic.dark.json` — 시맨틱 remap
- 수정: `packages/tokens/test/build.test.ts` — 하드코딩 색 단언 갱신
- 재생성: `packages/tokens/test/__snapshots__/build.test.ts.snap` — `vitest -u`
- 생성: `apps/docs/lib/palette.ts` — 파운데이션 표시용 팔레트 데이터
- 생성: `apps/docs/lib/palette.test.ts` — palette 데이터 형태 검증
- 수정: `apps/docs/app/foundations/page.tsx` — Colors 탭 재작성
- 수정: `apps/docs/app/components/stack/page.tsx` — 데모 하드코딩 `#3182f6` 교체
- 수정: `apps/docs/app/components/icon/page.tsx` — 데모 하드코딩 `#3182f6` 교체
- 생성: `.changeset/<name>.md` — 버전 bump

---

## Task 1: primitives.json 색 팔레트 교체

**Files:**
- Modify: `packages/tokens/src/primitives.json`

- [ ] **Step 1: `color` 블록과 `focusRing.color`를 새 팔레트로 교체**

`primitives.json` 최상단 `"color": { ... }` 객체 전체를 아래로 교체한다. (spacing 이하 비색 토큰은 그대로 두고 color 블록만 교체)

```json
  "color": {
    "green": {
      "050": { "value": "#EAF7F0" },
      "100": { "value": "#D3F0E2" },
      "200": { "value": "#A9E9CC" },
      "300": { "value": "#7FE6BC" },
      "400": { "value": "#45C393" },
      "500": { "value": "#1D9E6B" },
      "600": { "value": "#17855A" },
      "700": { "value": "#146D4B" },
      "800": { "value": "#12533A" },
      "900": { "value": "#123B2C" }
    },
    "neutral": {
      "000": { "value": "#FFFFFF" },
      "050": { "value": "#F6F8F6" },
      "100": { "value": "#ECF0ED" },
      "200": { "value": "#E2E8E4" },
      "300": { "value": "#C6CFC9" },
      "400": { "value": "#8A968F" },
      "500": { "value": "#5C6A62" },
      "700": { "value": "#35423B" },
      "900": { "value": "#16211C" }
    },
    "red":   { "500": { "value": "#C13A2A" }, "100": { "value": "#F8E0DB" } },
    "amber": { "700": { "value": "#7A5B16" }, "100": { "value": "#F5ECCF" } },
    "blue":  { "500": { "value": "#2E6ECC" }, "100": { "value": "#E1EBFA" } }
  },
```

그리고 파일 하단 `focusRing.color`를 교체한다:

```json
  "focusRing": {
    "color":  { "value": "rgba(29, 158, 107, 0.4)" },
    "width":  { "value": "2px" },
    "offset": { "value": "2px" }
  }
```

- [ ] **Step 2: JSON 유효성 확인**

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/tokens/src/primitives.json','utf8')); console.log('ok')"`
Expected: `ok` (파싱 에러 없음)

- [ ] **Step 3: 커밋하지 않고 Task 2로 진행** (semantic까지 함께 바꿔야 빌드가 성립하므로 Task 3에서 함께 검증 후 커밋)

---

## Task 2: semantic 토큰 remap (light + dark)

**Files:**
- Modify: `packages/tokens/src/semantic.light.json`
- Modify: `packages/tokens/src/semantic.dark.json`

- [ ] **Step 1: `semantic.light.json` 전체 교체**

```json
{
  "color": {
    "text": {
      "primary":   { "value": "{color.neutral.900}" },
      "secondary": { "value": "{color.neutral.500}" },
      "disabled":  { "value": "{color.neutral.400}" }
    },
    "background": {
      "default": { "value": "{color.neutral.000}" },
      "subtle":  { "value": "{color.neutral.050}" },
      "scrim":   { "value": "rgba(0, 0, 0, 0.5)" }
    },
    "brand": {
      "primary": { "value": "{color.green.500}" },
      "pressed": { "value": "{color.green.600}" }
    },
    "border": {
      "default": { "value": "{color.neutral.200}" }
    },
    "status": {
      "info":    { "value": "{color.blue.500}" },
      "success": { "value": "{color.green.500}" },
      "warning": { "value": "{color.amber.700}" },
      "danger":  { "value": "{color.red.500}" }
    }
  }
}
```

- [ ] **Step 2: `semantic.dark.json` 전체 교체**

```json
{
  "color": {
    "text": {
      "primary":   { "value": "{color.neutral.050}" },
      "secondary": { "value": "{color.neutral.400}" },
      "disabled":  { "value": "{color.neutral.500}" }
    },
    "background": {
      "default": { "value": "{color.neutral.900}" },
      "subtle":  { "value": "{color.neutral.700}" },
      "scrim":   { "value": "rgba(0, 0, 0, 0.6)" }
    },
    "brand": {
      "primary": { "value": "{color.green.500}" },
      "pressed": { "value": "{color.green.600}" }
    },
    "border": {
      "default": { "value": "{color.neutral.700}" }
    },
    "status": {
      "info":    { "value": "{color.blue.500}" },
      "success": { "value": "{color.green.500}" },
      "warning": { "value": "{color.amber.700}" },
      "danger":  { "value": "{color.red.500}" }
    }
  }
}
```

- [ ] **Step 3: 잔여 old-primitive 참조 확인**

Run: `grep -rnE '\{color\.(gray|white|black|yellow)\.' packages/tokens/src`
Expected: 출력 없음 (gray/white/black/yellow 참조가 모두 제거됨)

---

## Task 3: build.test.ts 단언 갱신 + 스냅샷 재생성

**Files:**
- Modify: `packages/tokens/test/build.test.ts`
- Regenerate: `packages/tokens/test/__snapshots__/build.test.ts.snap`

- [ ] **Step 1: `build.test.ts`의 하드코딩 색 단언을 새 값으로 교체**

다음 5개 라인을 정확히 교체한다(좌: 기존 → 우: 신규). SD 출력은 소문자 hex임에 주의.

`--color-blue-500: #3182f6;` (L20) →
```js
    expect(css).toContain("--color-blue-500: #2e6ecc;");
```

`export const ColorBlue500 = "#3182f6";` (L30) →
```js
    expect(js).toContain('export const ColorBlue500 = "#2e6ecc";');
```

`--color-text-primary: #191f28;` (L39) →
```js
    expect(css).toContain("--color-text-primary: #16211c;");
```

`--color-background-default: #191f28;` (L46, dark 블록) →
```js
    expect(css).toContain("--color-background-default: #16211c;");
```

status 3줄 (L51-53) →
```js
    expect(css).toContain("--color-status-success: #1d9e6b;");
    expect(css).toContain("--color-status-warning: #7a5b16;");
    expect(css).toContain("--color-status-danger: #c13a2a;");
```

`export const ColorStatusSuccess = "#00b26d";` (L55) →
```js
    expect(ts).toContain('export const ColorStatusSuccess = "#1d9e6b";');
```

`--focus-ring-color: rgba(49, 130, 246, 0.4);` (L70) →
```js
    expect(css).toContain("--focus-ring-color: rgba(29, 158, 107, 0.4);");
```

주의: `--color-background-default: #ffffff;` (L40, light)는 neutral.000이 여전히 `#ffffff`라 **변경 없음**.

- [ ] **Step 2: 테스트를 실행하며 스냅샷 재생성**

Run: `pnpm --filter @superbase/tokens exec vitest run -u`
Expected: PASS. 스냅샷(`build.test.ts.snap`)이 새 색 값으로 재작성됨.

- [ ] **Step 3: 스냅샷 diff 육안 검토**

Run: `git diff packages/tokens/test/__snapshots__/build.test.ts.snap`
Expected: 변경이 **색 값에만** 국한. 확인 포인트:
- `--color-green-050 ... --color-green-900`, `--color-neutral-000 ... --color-neutral-900` 신규 등장
- `--color-gray-*`, `--color-white`, `--color-black`, `--color-yellow-500` 소멸
- `--color-brand-primary: #1d9e6b;`, `--color-brand-pressed: #17855a;`
- 비색 토큰(spacing/size/shadow 등) 라인은 변화 없음

- [ ] **Step 4: 토큰 패키지 테스트 재확인(-u 없이)**

Run: `pnpm --filter @superbase/tokens test`
Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add packages/tokens/src packages/tokens/test
git commit -m "feat(tokens): 브랜드 컬러 blue→green 전면 교체

green 10단계 + neutral(그린틴트) 9단계로 팔레트 교체, yellow→amber,
status 색 갱신(success #1d9e6b, warning #7a5b16, danger #c13a2a, info #2e6ecc),
focus-ring 그린. 컴포넌트는 semantic 경유라 코드 무변경."
```

---

## Task 4: 토큰 재빌드 + 저장소 전체 검증

**Files:** (산출물만; 소스 변경 없음)
- Regenerate: `packages/tokens/dist/**`

- [ ] **Step 1: 토큰 재빌드**

Run: `pnpm --filter @superbase/tokens build`
Expected: 에러 없이 완료.

- [ ] **Step 2: 생성된 웹 CSS에 새 브랜드 값 확인**

Run: `grep -E 'color-brand-primary|color-status-warning|color-neutral-900' packages/tokens/dist/web/variables.css`
Expected 포함:
```
  --color-brand-primary: #1d9e6b;
  --color-status-warning: #7a5b16;
  --color-neutral-900: #16211c;
```

- [ ] **Step 3: RN 테마 산출물에 새 색(hex) 확인**

Run: `grep -E 'primary|1d9e6b' packages/tokens/dist/native/theme.js | head`
Expected: `brand.primary`가 `"#1d9e6b"`로 나타남(문자열 hex).

- [ ] **Step 4: 저장소 전체 typecheck/test/build**

Run: `pnpm turbo run typecheck test build`
Expected: 전체 PASS. (컴포넌트 테스트는 semantic 경유라 색 변경 영향 없음)

- [ ] **Step 5: dist 커밋 여부 확인 후 처리**

Run: `git status --porcelain packages/tokens/dist`
- dist가 git 추적 대상이면(출력 있음) 커밋:
```bash
git add packages/tokens/dist
git commit -m "chore(tokens): rebuild dist (green 브랜드)"
```
- 추적 대상이 아니면(.gitignore) 이 단계는 스킵.

---

## Task 5: 파운데이션 표시용 palette 데이터 생성 (TDD)

**Files:**
- Create: `apps/docs/lib/palette.ts`
- Test: `apps/docs/lib/palette.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`apps/docs/lib/palette.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { greenScale, neutralScale, semanticSwatches, greenRoles, neutralRoles } from "./palette";

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe("palette 데이터", () => {
  it("green은 10단계, neutral은 9단계", () => {
    expect(greenScale).toHaveLength(10);
    expect(neutralScale).toHaveLength(9);
  });

  it("모든 스와치 hex는 6자리 hex", () => {
    for (const s of [...greenScale, ...neutralScale]) {
      expect(s.hex).toMatch(HEX);
    }
  });

  it("역할 chip과 semantic 카드가 정의됨", () => {
    expect(greenRoles.length).toBeGreaterThan(0);
    expect(neutralRoles.length).toBeGreaterThan(0);
    expect(semanticSwatches).toHaveLength(4);
    for (const c of semanticSwatches) {
      expect(c.baseHex).toMatch(HEX);
      expect(c.softHex).toMatch(HEX);
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @superbase/docs exec vitest run lib/palette.test.ts`
Expected: FAIL ("Cannot find module './palette'" 등)

- [ ] **Step 3: `apps/docs/lib/palette.ts` 작성**

```ts
export interface Shade {
  step: string;
  hex: string;
}

export interface RoleChip {
  label: string;
  hex: string;
}

export const greenScale: Shade[] = [
  { step: "050", hex: "#EAF7F0" },
  { step: "100", hex: "#D3F0E2" },
  { step: "200", hex: "#A9E9CC" },
  { step: "300", hex: "#7FE6BC" },
  { step: "400", hex: "#45C393" },
  { step: "500", hex: "#1D9E6B" },
  { step: "600", hex: "#17855A" },
  { step: "700", hex: "#146D4B" },
  { step: "800", hex: "#12533A" },
  { step: "900", hex: "#123B2C" },
];

export const greenRoles: RoleChip[] = [
  { label: "050 페이지 배경", hex: "#EAF7F0" },
  { label: "100 Secondary 버튼·뱃지", hex: "#D3F0E2" },
  { label: "300 다크 위 액센트", hex: "#7FE6BC" },
  { label: "500 Primary 액션", hex: "#1D9E6B" },
  { label: "900 히어로·푸터", hex: "#123B2C" },
];

export const neutralScale: Shade[] = [
  { step: "000", hex: "#FFFFFF" },
  { step: "050", hex: "#F6F8F6" },
  { step: "100", hex: "#ECF0ED" },
  { step: "200", hex: "#E2E8E4" },
  { step: "300", hex: "#C6CFC9" },
  { step: "400", hex: "#8A968F" },
  { step: "500", hex: "#5C6A62" },
  { step: "700", hex: "#35423B" },
  { step: "900", hex: "#16211C" },
];

export const neutralRoles: RoleChip[] = [
  { label: "200 보더", hex: "#E2E8E4" },
  { label: "400 뮤트 텍스트", hex: "#8A968F" },
  { label: "500 보조 텍스트", hex: "#5C6A62" },
  { label: "900 본문 텍스트", hex: "#16211C" },
];

export interface SemanticSwatch {
  name: string;
  baseLabel: string;
  baseHex: string;
  softLabel: string;
  softHex: string;
  /** 예시 뱃지 라벨 */
  example: string;
}

export const semanticSwatches: SemanticSwatch[] = [
  { name: "Success", baseLabel: "green.500", baseHex: "#1D9E6B", softLabel: "green.100", softHex: "#D3F0E2", example: "완료" },
  { name: "Danger", baseLabel: "red.500 #C13A2A", baseHex: "#C13A2A", softLabel: "red.100 #F8E0DB", softHex: "#F8E0DB", example: "실패" },
  { name: "Warning", baseLabel: "amber.700 #7A5B16", baseHex: "#7A5B16", softLabel: "amber.100 #F5ECCF", softHex: "#F5ECCF", example: "대기중" },
  { name: "Info", baseLabel: "blue.500 #2E6ECC", baseHex: "#2E6ECC", softLabel: "blue.100 #E1EBFA", softHex: "#E1EBFA", example: "안내" },
];
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm --filter @superbase/docs exec vitest run lib/palette.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/lib/palette.ts apps/docs/lib/palette.test.ts
git commit -m "feat(docs): 파운데이션 컬러 팔레트 표시 데이터 추가"
```

---

## Task 6: 파운데이션 페이지 Colors 탭 재작성

**Files:**
- Modify: `apps/docs/app/foundations/page.tsx`

기존 파일은 Colors/Typography/Spacing/Radius/Effects 탭 구조다. **Colors 탭의 content(`colorsPanel`)만** 새 팔레트 표시로 교체하고, 나머지 탭과 `ComponentDoc`/`Tabs` 구조는 유지한다.

- [ ] **Step 1: import 교체 — semanticColors 대신 palette 사용**

파일 상단 import에서 `semanticColors`, `ColorGroup`, `Swatch` 관련을 정리하고 palette를 추가한다. 기존:
```ts
import { Swatch } from "../../components/foundations/Swatch";
import { semanticColors, spacingScale, fontSizes, radii, shadows, effectTokens, type ColorGroup } from "../../lib/tokens";
```
→ 로 교체:
```ts
import { spacingScale, fontSizes, radii, shadows, effectTokens } from "../../lib/tokens";
import { greenScale, greenRoles, neutralScale, neutralRoles, semanticSwatches } from "../../lib/palette";
```
(`Swatch`, `semanticColors`, `ColorGroup`은 Colors 탭에서만 쓰였으므로 제거. `COLOR_GROUPS` 상수도 제거)

- [ ] **Step 2: `COLOR_GROUPS` 상수와 기존 `colorsPanel` 정의를 새 구현으로 교체**

`const COLOR_GROUPS = [...]` 블록을 삭제하고, 기존 `const colorsPanel = ( ... )` 전체를 아래로 교체한다:

```tsx
const eyebrow: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "var(--font-size-caption)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "var(--color-brand-primary)",
  margin: "0 0 var(--spacing-2)",
};
const scaleTitle: React.CSSProperties = {
  fontSize: "var(--font-size-title)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: "var(--spacing-8) 0 var(--spacing-3)",
};
const roleChip: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
  border: "1px solid var(--color-border-default)",
};
const shadeCaption: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "11px",
  color: "var(--color-text-secondary)",
  lineHeight: 1.4,
};

function ScaleBar({ shades }: { shades: { step: string; hex: string }[] }) {
  return (
    <div>
      <div style={{ display: "flex", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-border-default)" }}>
        {shades.map((s) => (
          <div key={s.step} style={{ flex: 1, height: 96, background: s.hex }} />
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "var(--spacing-2)" }}>
        {shades.map((s) => (
          <div key={s.step} style={{ flex: 1, paddingRight: "var(--spacing-1)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.step}</div>
            <div style={shadeCaption}>{s.hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const colorsPanel = (
  <div>
    <div style={eyebrow}>FOUNDATION · COLOR</div>
    <p style={sub}>
      모든 색은 oklch로 설계해 스케일 전체에서 지각적 밝기가 일정하게 유지됩니다. 아래 HEX는 근사값이에요.
    </p>

    <div style={scaleTitle}>
      Green <span style={{ fontSize: "var(--font-size-caption)", fontWeight: 400, color: "var(--color-text-secondary)" }}>브랜드 · 액션 · 하이라이트</span>
    </div>
    <ScaleBar shades={greenScale} />
    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginTop: "var(--spacing-3)" }}>
      {greenRoles.map((r) => (
        <span key={r.label} style={{ ...roleChip, background: r.hex, color: r.hex === "#7FE6BC" || Number.parseInt(r.hex.slice(1), 16) > 0xaaaaaa ? "var(--color-text-primary)" : "#fff", borderColor: "transparent" }}>
          {r.label}
        </span>
      ))}
    </div>

    <div style={scaleTitle}>
      Neutral <span style={{ fontSize: "var(--font-size-caption)", fontWeight: 400, color: "var(--color-text-secondary)" }}>그린 틴트 회색 · 텍스트 · 보더 · 서피스</span>
    </div>
    <ScaleBar shades={neutralScale} />
    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginTop: "var(--spacing-3)" }}>
      {neutralRoles.map((r) => (
        <span key={r.label} style={{ ...roleChip, background: "var(--color-background-default)" }}>
          {r.label}
        </span>
      ))}
    </div>

    <div style={scaleTitle}>
      Semantic <span style={{ fontSize: "var(--font-size-caption)", fontWeight: 400, color: "var(--color-text-secondary)" }}>상태 표현 · Success는 Green 스케일을 그대로 사용</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
      {semanticSwatches.map((c) => (
        <div key={c.name} style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)" }}>
          <div style={{ fontSize: "var(--font-size-body)", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--spacing-3)" }}>{c.name}</div>
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <div style={{ flex: 1, height: 56, borderRadius: "var(--radius-md)", background: c.baseHex }} />
            <div style={{ flex: 1, height: 56, borderRadius: "var(--radius-md)", background: c.softHex }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--spacing-2)" }}>
            <span style={shadeCaption}>{c.baseLabel}</span>
            <span style={shadeCaption}>{c.softLabel}</span>
          </div>
          <span style={{ display: "inline-block", marginTop: "var(--spacing-3)", fontSize: "var(--font-size-caption)", fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-full)", background: c.softHex, color: c.baseHex }}>
            {c.example}
          </span>
        </div>
      ))}
    </div>
  </div>
);
```

- [ ] **Step 3: 타입체크**

Run: `pnpm --filter @superbase/docs typecheck`
Expected: 에러 없음. (미사용 import가 남아 있으면 제거)

- [ ] **Step 4: 문서 앱 테스트**

Run: `pnpm --filter @superbase/docs test`
Expected: PASS. (기존 Swatch.test 등은 그대로 통과 — Swatch 컴포넌트 자체는 삭제하지 않음)

- [ ] **Step 5: 빌드로 페이지 렌더 확인**

Run: `pnpm --filter @superbase/docs build`
Expected: `/foundations` 포함 빌드 성공.

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/app/foundations/page.tsx
git commit -m "feat(docs): 파운데이션 Colors 탭을 Green/Neutral/Semantic 팔레트로 재작성"
```

---

## Task 7: 문서 데모의 하드코딩 색 정리

**Files:**
- Modify: `apps/docs/app/components/stack/page.tsx`
- Modify: `apps/docs/app/components/icon/page.tsx`

데모 예시에서 임의 색으로 쓰인 `#3182f6`(구 브랜드 블루)을 새 브랜드 그린 `#1d9e6b`으로 교체해 시각적 일관성을 맞춘다.

- [ ] **Step 1: stack 페이지 교체**

`apps/docs/app/components/stack/page.tsx`의 `backgroundColor: "#3182f6"` → `backgroundColor: "#1d9e6b"`.

- [ ] **Step 2: icon 페이지 교체**

`apps/docs/app/components/icon/page.tsx`의 두 곳(`color="#3182f6"` 코드 예시 문자열과 `<RNIcon ... color="#3182f6" />`) → `#1d9e6b`.

- [ ] **Step 3: 잔여 확인**

Run: `grep -rn '3182f6' apps/docs/app`
Expected: 출력 없음. (테스트 파일 `Swatch.test.tsx`의 `#3182f6`은 임의 테스트 색이므로 무관 — `apps/docs/app` 범위에만 국한해 확인)

- [ ] **Step 4: 타입체크 + 커밋**

Run: `pnpm --filter @superbase/docs typecheck`
Expected: 에러 없음.
```bash
git add apps/docs/app/components/stack/page.tsx apps/docs/app/components/icon/page.tsx
git commit -m "chore(docs): 데모 예시 색을 새 브랜드 그린으로 교체"
```

---

## Task 8: changeset + 최종 검증

**Files:**
- Create: `.changeset/<name>.md`

- [ ] **Step 1: changeset 파일 생성**

`.changeset/green-brand.md`:
```markdown
---
"@superbase/tokens": minor
---

브랜드 컬러를 blue에서 green으로 전면 교체. green 10단계 + neutral(그린 틴트) 9단계로 팔레트를 재구성하고, yellow를 amber로 대체했습니다. status 색 갱신(success `#1d9e6b`, warning `#7a5b16`, danger `#c13a2a`, info `#2e6ecc`), focus-ring도 그린으로 변경. 컴포넌트는 semantic 토큰을 경유하므로 API·코드 변경은 없으며, 업그레이드 시 브랜드 색상만 그린으로 바뀝니다.
```

- [ ] **Step 2: 저장소 전체 최종 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전체 PASS.

- [ ] **Step 3: 육안 검증 (dev 서버)**

Run: `pnpm --filter @superbase/docs exec next dev -p 3100`
브라우저에서 확인:
- `/foundations` → Colors 탭에 Green 10 / Neutral 9 스케일 바 + Semantic 4카드가 시안대로 렌더
- `/components/button` → 버튼 미리보기가 **그린**으로 렌더
- 다크 모드 토글 → 배경/텍스트가 neutral 다크 스케일로 정상 전환

- [ ] **Step 4: 커밋**

```bash
git add .changeset
git commit -m "chore: changeset — green 브랜드 토큰 개편 (@superbase/tokens minor)"
```

---

## Self-Review 결과

- **스펙 커버리지**: primitives 교체(T1) / semantic remap(T2) / focusRing(T1) / 테스트·스냅샷(T3) / 재빌드·전체검증(T4) / palette 데이터(T5) / 파운데이션 페이지(T6) / 데모 색 정리(T7) / changeset(T8) — 스펙 스코프 8항목 모두 태스크에 매핑됨. 스코프아웃(사이트 크롬·홈·목록·상세·status subtle 토큰)은 B로 이월, 이 플랜에 없음(의도적).
- **Placeholder 스캔**: 모든 코드 스텝에 실제 내용 포함. "적절히 처리" 류 없음.
- **타입 일관성**: `Shade{step,hex}` / `RoleChip{label,hex}` / `SemanticSwatch{name,baseLabel,baseHex,softLabel,softHex,example}`가 palette.ts 정의(T5)와 page.tsx 사용(T6)에서 일치. `ScaleBar`가 받는 prop 형태(`{step,hex}[]`)가 `greenScale`/`neutralScale` 타입과 일치.
- **주의**: T6 Step1에서 미사용이 되는 import(`Swatch`, `semanticColors`, `ColorGroup`, `COLOR_GROUPS`)를 반드시 제거해야 typecheck(`noUnusedLocals` 가능성) 통과.
