# Plan 11 — Foundations 페이지 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/foundations` 페이지를 ComponentDoc 디자인 언어로 다시 만들고, 색·타이포·간격·반경 토큰을 실제 값(런타임에 CSS 변수에서 읽은, 다크모드 반응형 hex)과 함께 보여준다.

**Architecture:** `useTokenValue(cssVar)` 클라이언트 훅이 `getComputedStyle`로 토큰 값을 읽고 `data-theme` 변경을 `MutationObserver`로 구독해 다크모드 시 갱신한다. `Swatch`(색 카드)·`TokenValue`(값 라벨)가 이 훅을 쓴다. Foundations 페이지는 `ComponentDoc` + Colors(semantic 그룹)/Typography(실제 크기 specimen)/Spacing(막대)/Radius(박스) 섹션으로 구성한다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Vitest + jsdom + Testing Library. `apps/docs`만 변경.

> 전제: 문서 리디자인(Plan 7/8)이 머지됨 — `apps/docs/components/docs/ComponentDoc`이 있고, `apps/docs/components/Swatch.tsx`(구버전)과 `apps/docs/app/foundations/page.tsx`(평면 버전), `apps/docs/lib/tokens.ts`(semanticColors 12개 + spacingScale + fontSizes + radii)가 존재. docs vitest는 jsdom + `css: true`. Node 22.

> import 경로: `app/foundations/page.tsx`에서 `../../components/...`, `../../lib/tokens`. `components/foundations/*`끼리는 `./`.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `apps/docs/components/foundations/useTokenValue.ts` (+ `.test.tsx`) | CSS 변수 값 읽기(테마 반응) 훅 |
| `apps/docs/components/foundations/TokenValue.tsx` | 값 라벨(모노스페이스) |
| `apps/docs/components/foundations/Swatch.tsx` (+ `.test.tsx`) | 색 카드(칩+이름+hex) |
| `apps/docs/components/foundations/Swatch.module.css` | 스와치 스타일 |
| `apps/docs/lib/tokens.ts` (수정) | 색에 `group` 추가 |
| `apps/docs/lib/tokens.test.ts` (수정) | 그룹 검증 추가 |
| `apps/docs/app/foundations/page.tsx` (재작성) | 리디자인 페이지 |
| `apps/docs/components/Swatch.tsx` (삭제) | 구버전 제거 |

---

## Task 1: useTokenValue 훅 + TokenValue (TDD)

**Files:** Create `apps/docs/components/foundations/useTokenValue.ts`, `useTokenValue.test.tsx`, `TokenValue.tsx`

- [ ] **Step 1: 실패 테스트 — `useTokenValue.test.tsx`**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { useTokenValue } from "./useTokenValue";

function Probe({ cssVar }: { cssVar: string }) {
  return <span>{useTokenValue(cssVar)}</span>;
}

describe("useTokenValue", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--test-color");
    document.documentElement.removeAttribute("data-theme");
  });

  it("reads the computed value of a CSS variable", () => {
    document.documentElement.style.setProperty("--test-color", "#abc123");
    render(<Probe cssVar="--test-color" />);
    expect(screen.getByText("#abc123")).toBeInTheDocument();
  });

  it("updates when data-theme changes", async () => {
    document.documentElement.style.setProperty("--test-color", "#111111");
    render(<Probe cssVar="--test-color" />);
    expect(screen.getByText("#111111")).toBeInTheDocument();

    document.documentElement.style.setProperty("--test-color", "#222222");
    document.documentElement.setAttribute("data-theme", "dark");
    await waitFor(() =>
      expect(screen.getByText("#222222")).toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./useTokenValue` 없음).

- [ ] **Step 3: `useTokenValue.ts`**

```ts
"use client";
import { useEffect, useState } from "react";

export function useTokenValue(cssVar: string): string {
  const [value, setValue] = useState("");

  useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim(),
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [cssVar]);

  return value;
}
```

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS (2 tests).

- [ ] **Step 5: `TokenValue.tsx`**

```tsx
"use client";
import { useTokenValue } from "./useTokenValue";

export function TokenValue({ cssVar }: { cssVar: string }) {
  const value = useTokenValue(cssVar);
  return (
    <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-text-secondary)" }}>
      {value}
    </span>
  );
}
```

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/components/foundations/useTokenValue.ts apps/docs/components/foundations/useTokenValue.test.tsx apps/docs/components/foundations/TokenValue.tsx
git commit -m "feat(docs): add useTokenValue hook + TokenValue label"
```

---

## Task 2: 색 그룹 데이터 + Swatch 재설계 (TDD)

**Files:** Modify `apps/docs/lib/tokens.ts`, `apps/docs/lib/tokens.test.ts`; Create `apps/docs/components/foundations/Swatch.tsx`, `Swatch.module.css`, `Swatch.test.tsx`; Delete `apps/docs/components/Swatch.tsx`

- [ ] **Step 1: tokens.test.ts에 그룹 검증 추가 — `apps/docs/lib/tokens.test.ts`의 describe 블록 안에 추가**

```ts
  it("assigns every semantic color a valid group", () => {
    for (const c of semanticColors) {
      expect(["text", "brand", "status"]).toContain(c.group);
    }
  });
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`c.group` 없음 → 타입/런타임 에러).

- [ ] **Step 3: `apps/docs/lib/tokens.ts`의 색 타입/데이터에 group 추가**

파일 상단의 `export interface DisplayToken { name: string; cssVar: string; }` 아래에 추가:
```ts
export type ColorGroup = "text" | "brand" | "status";

export interface ColorToken extends DisplayToken {
  group: ColorGroup;
}
```

그리고 `export const semanticColors: DisplayToken[] = [ ... ];` 를 아래 전체로 교체(타입 `ColorToken[]` + 각 항목에 group):
```ts
export const semanticColors: ColorToken[] = [
  { name: "text.primary", cssVar: "--color-text-primary", group: "text" },
  { name: "text.secondary", cssVar: "--color-text-secondary", group: "text" },
  { name: "text.disabled", cssVar: "--color-text-disabled", group: "text" },
  { name: "background.default", cssVar: "--color-background-default", group: "brand" },
  { name: "background.subtle", cssVar: "--color-background-subtle", group: "brand" },
  { name: "brand.primary", cssVar: "--color-brand-primary", group: "brand" },
  { name: "brand.pressed", cssVar: "--color-brand-pressed", group: "brand" },
  { name: "border.default", cssVar: "--color-border-default", group: "brand" },
  { name: "status.info", cssVar: "--color-status-info", group: "status" },
  { name: "status.success", cssVar: "--color-status-success", group: "status" },
  { name: "status.warning", cssVar: "--color-status-warning", group: "status" },
  { name: "status.danger", cssVar: "--color-status-danger", group: "status" },
];
```
(`fontSizes`/`radii`/`spacingScale`는 그대로 둔다.)

- [ ] **Step 4: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS (색 12개 + 그룹 검증).

- [ ] **Step 5: `Swatch.module.css`**

```css
.swatch {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.chip { height: 56px; }
.meta { padding: var(--spacing-2) var(--spacing-3); display: flex; flex-direction: column; gap: 2px; }
.value {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 6: 실패 테스트 — `apps/docs/components/foundations/Swatch.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Swatch } from "./Swatch";

describe("Swatch", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--color-test");
  });

  it("renders the token name", () => {
    render(<Swatch name="brand.primary" cssVar="--color-brand-primary" />);
    expect(screen.getByText("brand.primary")).toBeInTheDocument();
  });

  it("renders the resolved hex value, uppercased", () => {
    document.documentElement.style.setProperty("--color-test", "#3182f6");
    render(<Swatch name="test" cssVar="--color-test" />);
    expect(screen.getByText("#3182F6")).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./Swatch` 없음).

- [ ] **Step 8: `apps/docs/components/foundations/Swatch.tsx`**

```tsx
"use client";
import { Text } from "@superbase/react";
import { useTokenValue } from "./useTokenValue";
import styles from "./Swatch.module.css";

export function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  const value = useTokenValue(cssVar);
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={{ background: `var(${cssVar})` }} />
      <div className={styles.meta}>
        <Text variant="caption" weight="medium">
          {name}
        </Text>
        <span className={styles.value}>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS.

> 구 `apps/docs/components/Swatch.tsx`는 아직 구 foundations 페이지가 import 중이므로 **이 Task에서 삭제하지 않는다.** 삭제는 Task 3(페이지 교체 후)에서 한다.

- [ ] **Step 10: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/lib/tokens.ts apps/docs/lib/tokens.test.ts apps/docs/components/foundations/Swatch.tsx apps/docs/components/foundations/Swatch.module.css apps/docs/components/foundations/Swatch.test.tsx
git commit -m "feat(docs): color groups + Swatch card with resolved hex"
```

---

## Task 3: Foundations 페이지 재작성 + 검증

**Files:** Rewrite `apps/docs/app/foundations/page.tsx`; Delete `apps/docs/components/Swatch.tsx`

- [ ] **Step 1: `apps/docs/app/foundations/page.tsx` 전체를 아래로 교체**

```tsx
import { ComponentDoc } from "../../components/docs/ComponentDoc";
import { Swatch } from "../../components/foundations/Swatch";
import { TokenValue } from "../../components/foundations/TokenValue";
import { semanticColors, spacingScale, fontSizes, radii, type ColorGroup } from "../../lib/tokens";

const COLOR_GROUPS: { key: ColorGroup; label: string }[] = [
  { key: "text", label: "Text" },
  { key: "brand", label: "Brand & Background" },
  { key: "status", label: "Status" },
];

const h2: React.CSSProperties = {
  fontSize: "var(--font-size-title)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: "var(--spacing-8) 0 4px",
};
const sub: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
  margin: "0 0 var(--spacing-4)",
};
const groupLabel: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  fontWeight: 700,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  margin: "var(--spacing-4) 0 var(--spacing-2)",
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "var(--spacing-3)",
};
const labelMono: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

export default function FoundationsPage() {
  return (
    <ComponentDoc
      title="Foundations"
      lead="Superbase 디자인 시스템의 토큰. 색·타이포·간격·반경을 실제 값과 함께 보여줍니다."
    >
      <section>
        <h2 style={h2}>Colors</h2>
        <p style={sub}>semantic 토큰. 다크 모드에서 값이 함께 바뀝니다.</p>
        {COLOR_GROUPS.map((g) => (
          <div key={g.key}>
            <div style={groupLabel}>{g.label}</div>
            <div style={grid}>
              {semanticColors
                .filter((c) => c.group === g.key)
                .map((c) => (
                  <Swatch key={c.cssVar} name={c.name} cssVar={c.cssVar} />
                ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 style={h2}>Typography</h2>
        <p style={sub}>실제 크기로 보는 타입 스케일.</p>
        <div>
          {fontSizes.map((f) => (
            <div
              key={f.cssVar}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--spacing-4)",
                padding: "var(--spacing-3) 0",
                borderBottom: "1px solid var(--color-background-subtle)",
              }}
            >
              <span style={{ flex: 1, fontSize: `var(${f.cssVar})`, color: "var(--color-text-primary)" }}>
                {f.name}
              </span>
              <span style={labelMono}>
                {f.name} · <TokenValue cssVar={f.cssVar} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={h2}>Spacing</h2>
        <p style={sub}>4px 기반 스케일.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
          {spacingScale.map((n) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
              <div
                style={{
                  height: 16,
                  width: n === 0 ? "1px" : `var(--spacing-${n})`,
                  background: "var(--color-brand-primary)",
                  borderRadius: 3,
                }}
              />
              <span style={labelMono}>
                spacing-{n} · <TokenValue cssVar={`--spacing-${n}`} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={h2}>Radius</h2>
        <p style={sub}>모서리 반경.</p>
        <div style={{ display: "flex", gap: "var(--spacing-6)", flexWrap: "wrap" }}>
          {radii.map((r) => (
            <div key={r.cssVar} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-2)" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--color-background-subtle)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: `var(${r.cssVar})`,
                }}
              />
              <span style={labelMono}>
                {r.name} · <TokenValue cssVar={r.cssVar} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </ComponentDoc>
  );
}
```

> 주: 페이지는 서버 컴포넌트로 두고(상태 없음), 클라이언트 컴포넌트(`Swatch`/`TokenValue`)를 자식으로 렌더한다. `import { ... type ColorGroup }`이 안 되면 `import type { ColorGroup }`을 별도 줄로 분리하라.

- [ ] **Step 2: 구 Swatch 삭제 (이제 참조 없음)**

```bash
git rm apps/docs/components/Swatch.tsx
```

- [ ] **Step 3: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전부 통과. docs `next build`에 `/foundations` 라우트 생성. docs 테스트 증가(useTokenValue 2 + Swatch 2 + tokens 그룹 1 = 기존 12 + 5 = 17). 실제 수치 보고.
검증: `grep -rn "components/Swatch" apps/docs` 결과가 비어야 한다(구 Swatch 참조 없음).

- [ ] **Step 4: Commit**

```bash
git add apps/docs/app/foundations/page.tsx apps/docs/components/Swatch.tsx
git commit -m "feat(docs): redesign Foundations page (grouped colors + live values)"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 전부 통과한다.
- `/foundations`가 ComponentDoc 틀 + Colors(그룹)/Typography(specimen)/Spacing/Radius로 구성된다.
- 색 스와치가 해석된 hex를 표시하고, 다크 모드 토글 시 값이 갱신된다.
- 토큰 값은 `useTokenValue`로 런타임에 읽어 docs에 하드코딩이 없다.
- 구 `components/Swatch.tsx`가 제거되고 참조가 없다.

## 이후

- 머지 후 `/foundations`를 라이트/다크로 시각 확인(특히 hex 값 갱신).
- (범위 밖) 토큰 값 복사 버튼, primitive 팔레트 노출, shadow 토큰.
