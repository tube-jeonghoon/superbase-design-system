# 사이트 리뉴얼 (B) 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 문서 사이트를 상단 네비 기반으로 리뉴얼한다 — 공용 셸(SiteHeader/그린 SiteFooter) + 마케팅 홈 + 컴포넌트 목록(3열·필터·검색) + 상세(그룹 사이드바 셸) + 릴리즈 페이지. 실제 저장소 데이터(17종, v0.5.0) 기준.

**Architecture:** 루트 `layout.tsx`가 `AppShell`(전역 사이드바) 대신 `SiteHeader` + `{children}` + `SiteFooter`를 제공한다. 홈·목록·파운데이션·릴리즈는 풀폭. 상세만 Next.js route group `(reference)`의 `layout.tsx`가 좌측 그룹 사이드바를 제공한다. 컴포넌트 메타는 `lib/catalog.ts`, 릴리즈는 `lib/releases.ts` 단일 소스. 상세 콘텐츠의 기존 Web/RN 플랫폼 탭은 유지하고 셸만 교체.

**Tech Stack:** Next.js App Router(15), `@superbase/react`/`react-native`(웹 별칭 react-native-web), CSS Modules + 인라인 스타일 + 토큰 CSS 변수, Vitest + Testing Library.

**참조 스펙:** `docs/superpowers/specs/2026-07-07-site-renewal-design.md`

**의도적 스펙 편차:** 상세 탭은 시안의 "디자인/코드/접근성"이 아니라 기존 "Web/React Native" 플랫폼 탭을 유지한다(실제 콘텐츠 보존, 전면 재작성 회피). 시각 리뉴얼은 셸/사이드바/마케팅 페이지가 담당.

---

## 파일 구조

- 생성: `apps/docs/components/site/SiteHeader.tsx` (+ `.module.css`) — 상단 네비
- 생성: `apps/docs/components/site/SiteFooter.tsx` (+ `.module.css`) — 그린 푸터
- 생성: `apps/docs/lib/catalog.ts` (+ `catalog.test.ts`) — 컴포넌트 카탈로그
- 생성: `apps/docs/lib/releases.ts` (+ `releases.test.ts`) — 릴리즈 데이터
- 수정: `apps/docs/app/layout.tsx` — AppShell → SiteHeader/SiteFooter
- 삭제: `apps/docs/components/AppShell.tsx`, `SideNav.tsx`, `SideNav.module.css`, `SideNav.test.tsx`
- 수정: `apps/docs/app/page.tsx` — 마케팅 홈
- 수정: `apps/docs/app/components/page.tsx` — 목록(그리드/필터/검색)
- 생성: `apps/docs/app/components/(reference)/layout.tsx` — 상세 그룹 사이드바
- 이동: `apps/docs/app/components/<slug>/` (17개, `button` 등) → `apps/docs/app/components/(reference)/<slug>/`
- 수정: `apps/docs/app/components/(reference)/button/page.tsx` — Variants 표 + Do/Don't
- 생성: `apps/docs/app/releases/page.tsx` — 릴리즈 타임라인

---

## Phase 1 — 공용 셸

### Task 1: SiteFooter

**Files:** Create `apps/docs/components/site/SiteFooter.tsx`, `apps/docs/components/site/SiteFooter.module.css`

- [ ] **Step 1: SiteFooter.module.css 작성**
```css
.footer {
  background: var(--color-green-900, #123b2c);
  color: #fff;
  padding: var(--spacing-8) var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
}
.copy { font-size: var(--font-size-caption); opacity: 0.85; }
.links { display: flex; gap: var(--spacing-6); }
.links a { color: #fff; font-weight: 700; font-size: var(--font-size-caption); }
.links a:hover { text-decoration: underline; }
```

- [ ] **Step 2: SiteFooter.tsx 작성**
```tsx
import styles from "./SiteFooter.module.css";

const GITHUB = "https://github.com/tube-jeonghoon/superbase-design-system";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© 2026 Superbase Design System</span>
      <nav className={styles.links}>
        <a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
        <a href="#">Figma</a>
        <a href="#">Changelog RSS</a>
      </nav>
    </footer>
  );
}
```

- [ ] **Step 3: 타입체크**
Run: `pnpm --filter @superbase/docs typecheck`
Expected: 에러 없음.

- [ ] **Step 4: 커밋**
```bash
git add apps/docs/components/site/SiteFooter.tsx apps/docs/components/site/SiteFooter.module.css
git commit -m "feat(docs): SiteFooter (그린 푸터)"
```

### Task 2: SiteHeader

**Files:** Create `apps/docs/components/site/SiteHeader.tsx`, `apps/docs/components/site/SiteHeader.module.css`

- [ ] **Step 1: SiteHeader.module.css 작성**
```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-8);
  background: var(--color-background-default);
  border-bottom: 1px solid var(--color-border-default);
}
.brand { display: flex; align-items: center; gap: var(--spacing-2); font-weight: 800; font-size: var(--font-size-body); color: var(--color-text-primary); }
.dot { width: 20px; height: 20px; border-radius: var(--radius-full); background: var(--color-green-900, #123b2c); }
.brandAccent { color: var(--color-brand-primary); }
.nav { display: flex; align-items: center; gap: var(--spacing-6); }
.link { font-size: var(--font-size-body); font-weight: 600; color: var(--color-text-secondary); padding-bottom: 2px; }
.link:hover { color: var(--color-text-primary); }
.active { color: var(--color-brand-primary); border-bottom: 2px solid var(--color-brand-primary); }
.cta { border: 1px solid var(--color-text-primary); border-radius: var(--radius-full); padding: 8px 18px; font-weight: 700; font-size: var(--font-size-caption); color: var(--color-text-primary); }
.right { display: flex; align-items: center; gap: var(--spacing-4); }
```

- [ ] **Step 2: SiteHeader.tsx 작성 (클라이언트, usePathname 활성표시)**
```tsx
"use client";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";
import { ThemeToggle } from "../ThemeToggle";

const NAV = [
  { href: "/#principles", label: "원칙", match: "/#" },
  { href: "/foundations", label: "파운데이션", match: "/foundations" },
  { href: "/components", label: "컴포넌트", match: "/components" },
  { href: "/releases", label: "릴리즈", match: "/releases" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <a href="/" className={styles.brand}>
        <span className={styles.dot} />
        SDS<span className={styles.brandAccent}>.design</span>
      </a>
      <nav className={styles.nav}>
        {NAV.map((n) => {
          const active = n.match !== "/#" && pathname.startsWith(n.match);
          return (
            <a key={n.href} href={n.href} className={`${styles.link} ${active ? styles.active : ""}`}>
              {n.label}
            </a>
          );
        })}
      </nav>
      <div className={styles.right}>
        <a href="/components" className={styles.cta}>Get started</a>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 타입체크 + 커밋**
Run: `pnpm --filter @superbase/docs typecheck` → 에러 없음.
```bash
git add apps/docs/components/site/SiteHeader.tsx apps/docs/components/site/SiteHeader.module.css
git commit -m "feat(docs): SiteHeader (상단 네비 + 활성표시 + 다크토글)"
```

### Task 3: layout.tsx 교체 + AppShell/SideNav 제거

**Files:** Modify `apps/docs/app/layout.tsx`; Delete `apps/docs/components/AppShell.tsx`, `SideNav.tsx`, `SideNav.module.css`, `SideNav.test.tsx`

- [ ] **Step 1: layout.tsx의 body를 SiteHeader/SiteFooter로 교체**
`import { AppShell } from "../components/AppShell";` 제거, 추가:
```tsx
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
```
`<body>` 내부를:
```tsx
      <body>
        <SiteHeader />
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--spacing-8)", width: "100%" }}>
          {children}
        </main>
        <SiteFooter />
      </body>
```
(상세 페이지는 Phase 5에서 자체 사이드바 레이아웃이 이 `<main>` 안에 렌더된다.)

- [ ] **Step 2: AppShell/SideNav 파일 삭제**
```bash
git rm apps/docs/components/AppShell.tsx apps/docs/components/SideNav.tsx apps/docs/components/SideNav.module.css apps/docs/components/SideNav.test.tsx
```

- [ ] **Step 3: 잔여 참조 확인**
Run: `grep -rn "AppShell\|SideNav" apps/docs --include=*.tsx --include=*.ts`
Expected: 출력 없음. (있으면 제거)

- [ ] **Step 4: 타입체크 + 테스트 + 빌드**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs test && pnpm --filter @superbase/docs build`
Expected: 모두 통과. 모든 기존 페이지가 새 셸 아래 렌더(사이드바 없이 풀폭).

- [ ] **Step 5: 커밋**
```bash
git add apps/docs/app/layout.tsx apps/docs/components
git commit -m "feat(docs): 루트 레이아웃을 상단 네비 셸로 교체, AppShell/SideNav 제거"
```

---

## Phase 2 — 데이터

### Task 4: catalog.ts (TDD)

**Files:** Create `apps/docs/lib/catalog.ts`, `apps/docs/lib/catalog.test.ts`

- [ ] **Step 1: 실패 테스트 작성** — `catalog.test.ts`
```ts
import { describe, it, expect } from "vitest";
import { catalog, categoryOrder } from "./catalog";
import { componentNav } from "../components/docs/componentNav";

describe("catalog", () => {
  it("모든 컴포넌트 슬러그가 componentNav와 일치", () => {
    const navSlugs = new Set(componentNav.map((n) => n.slug));
    const catSlugs = new Set(catalog.map((c) => c.slug));
    expect(catSlugs).toEqual(navSlugs);
  });

  it("모든 항목의 category가 categoryOrder에 속함", () => {
    for (const c of catalog) {
      expect(categoryOrder).toContain(c.category);
    }
  });

  it("status는 stable|updated|new 중 하나이고 blurb는 비어있지 않음", () => {
    for (const c of catalog) {
      expect(["stable", "updated", "new"]).toContain(c.status);
      expect(c.blurb.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**
Run: `pnpm --filter @superbase/docs exec vitest run lib/catalog.test.ts`
Expected: FAIL ("Cannot find module './catalog'").

- [ ] **Step 3: catalog.ts 작성**
```ts
export type Category = "Actions" | "Inputs" | "Feedback" | "Navigation" | "Layout" | "Data" | "Foundation";
export type Status = "stable" | "updated" | "new";

export interface CatalogItem {
  slug: string;
  name: string;
  category: Category;
  status: Status;
  blurb: string;
}

export const categoryOrder: Category[] = ["Actions", "Inputs", "Feedback", "Navigation", "Layout", "Data", "Foundation"];

export const catalog: CatalogItem[] = [
  { slug: "button", name: "Button", category: "Actions", status: "stable", blurb: "액션을 유도하는 기본 버튼. variant·size·loading·아이콘 슬롯." },
  { slug: "textfield", name: "TextField", category: "Inputs", status: "stable", blurb: "텍스트 입력. size·prefix/suffix·clearable·helperText." },
  { slug: "checkbox", name: "Checkbox", category: "Inputs", status: "stable", blurb: "체크박스. indeterminate 지원." },
  { slug: "radio", name: "Radio", category: "Inputs", status: "stable", blurb: "라디오 그룹. RadioGroup + Radio." },
  { slug: "switch", name: "Switch", category: "Inputs", status: "stable", blurb: "온/오프 토글. size sm/md." },
  { slug: "toast", name: "Toast", category: "Feedback", status: "stable", blurb: "명령형 useToast API. auto-dismiss·action." },
  { slug: "modal", name: "Modal", category: "Feedback", status: "stable", blurb: "compound Modal. focus-trap·scroll-lock." },
  { slug: "spinner", name: "Spinner", category: "Feedback", status: "stable", blurb: "로딩 스피너." },
  { slug: "badge", name: "Badge", category: "Feedback", status: "stable", blurb: "상태 뱃지. 6색·size·dot·icon." },
  { slug: "tabs", name: "Tabs", category: "Navigation", status: "stable", blurb: "compound Tabs. ARIA·키보드 내비." },
  { slug: "header", name: "Header", category: "Navigation", status: "new", blurb: "compound Header. onBack·알림 badge·bar/floating." },
  { slug: "bottom-navigation", name: "BottomNavigation", category: "Navigation", status: "updated", blurb: "하단 내비 바. bar/floating variant." },
  { slug: "stack", name: "Stack", category: "Layout", status: "stable", blurb: "flex 레이아웃 프리미티브." },
  { slug: "card", name: "Card", category: "Layout", status: "stable", blurb: "elevation·bordered·padding 카드." },
  { slug: "avatar", name: "Avatar", category: "Data", status: "stable", blurb: "이미지·이니셜·폴백. group·4 size." },
  { slug: "text", name: "Text", category: "Foundation", status: "stable", blurb: "타이포그래피 프리미티브. variant·weight·color." },
  { slug: "icon", name: "Icon", category: "Foundation", status: "stable", blurb: "라인 아이콘. 명명 size(xs/sm/md/lg)." },
];
```

- [ ] **Step 4: 테스트 통과 확인**
Run: `pnpm --filter @superbase/docs exec vitest run lib/catalog.test.ts`
Expected: PASS (3 tests). 슬러그 집합이 componentNav와 정확히 일치해야 함(17개).

- [ ] **Step 5: 커밋**
```bash
git add apps/docs/lib/catalog.ts apps/docs/lib/catalog.test.ts
git commit -m "feat(docs): 컴포넌트 카탈로그 데이터(17종 분류·status)"
```

### Task 5: releases.ts (TDD)

**Files:** Create `apps/docs/lib/releases.ts`, `apps/docs/lib/releases.test.ts`

- [ ] **Step 1: 실패 테스트 작성** — `releases.test.ts`
```ts
import { describe, it, expect } from "vitest";
import { releases } from "./releases";

describe("releases", () => {
  it("최소 4개 릴리즈, 각 항목에 version/title/summary", () => {
    expect(releases.length).toBeGreaterThanOrEqual(4);
    for (const r of releases) {
      expect(r.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.summary.length).toBeGreaterThan(0);
    }
  });

  it("최신순(내림차순) 정렬", () => {
    const nums = releases.map((r) => r.version.split(".").map(Number));
    for (let i = 1; i < nums.length; i++) {
      const a = nums[i - 1], b = nums[i];
      const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      expect(cmp).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**
Run: `pnpm --filter @superbase/docs exec vitest run lib/releases.test.ts`
Expected: FAIL (모듈 없음).

- [ ] **Step 3: releases.ts 작성**
```ts
export interface Release {
  version: string;
  title: string;
  summary: string;
}

export const releases: Release[] = [
  { version: "0.5.0", title: "Header 컴포넌트 + bar/floating variant 통일", summary: "Header compound 신규(onBack·알림 badge). Header·BottomNavigation에 bar/floating variant 도입." },
  { version: "0.4.0", title: "BottomNavigation + 웹 컴포넌트 하드닝", summary: "BottomNavigation 신규. 10개 컴포넌트 forwardRef·토큰화·focus-ring, Button/TextField/Card/Avatar/Tabs/Modal/Toast 심화." },
  { version: "0.3.0", title: "@superbase/icons + 웹 Icon", summary: "자체 큐레이션 아이콘 데이터 패키지와 이를 소비하는 웹 Icon 컴포넌트 추가." },
  { version: "0.2.0", title: "status 색 + 기본 폼 컴포넌트", summary: "토큰 status 색(info/success/warning/danger), Checkbox·Radio·Badge·Spinner 추가." },
];
```

- [ ] **Step 4: 테스트 통과 확인**
Run: `pnpm --filter @superbase/docs exec vitest run lib/releases.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**
```bash
git add apps/docs/lib/releases.ts apps/docs/lib/releases.test.ts
git commit -m "feat(docs): 릴리즈 데이터(실제 CHANGELOG 기반 4버전)"
```

---

## Phase 3 — 홈

### Task 6: 홈 페이지 재작성

**Files:** Modify `apps/docs/app/page.tsx`

기존 홈(ComponentDoc 기반 설치 안내)을 마케팅 레이아웃으로 교체한다. 인라인 스타일 + 토큰 CSS 변수 사용. 클라이언트 컴포넌트(토큰 카드가 CSS 변수를 읽음).

- [ ] **Step 1: app/page.tsx 전체 교체**
```tsx
"use client";
import { releases } from "../lib/releases";

const TOKENS = [
  { name: "brand.primary", role: "Primary · 액션", cssVar: "--color-brand-primary" },
  { name: "green.900", role: "히어로 · 푸터", cssVar: "--color-green-900" },
  { name: "neutral.500", role: "보조 텍스트", cssVar: "--color-neutral-500" },
  { name: "background.subtle", role: "Surface · 배경", cssVar: "--color-background-subtle" },
];

const panel: React.CSSProperties = {
  background: "var(--color-green-900, #123b2c)",
  color: "#fff",
  borderRadius: "var(--radius-lg)",
  padding: "var(--spacing-8)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
      {/* 히어로 */}
      <section style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "var(--spacing-6)" }}>
        <div style={panel}>
          <span style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", color: "var(--color-green-300, #7fe6bc)", fontSize: "var(--font-size-caption)", fontWeight: 700 }}>
            SUPERBASE DESIGN SYSTEM
          </span>
          <h1 style={{ fontSize: "44px", fontWeight: 800, lineHeight: 1.2, margin: "var(--spacing-4) 0" }}>
            하나의 언어로,<br />모든 제품을.
          </h1>
          <p style={{ fontSize: "var(--font-size-body)", opacity: 0.9, marginBottom: "var(--spacing-6)" }}>
            토큰부터 컴포넌트, 가이드라인까지 — 팀 전체가 같은 기준으로 만들고 검증합니다.
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <a href="/components" style={{ background: "var(--color-green-300, #7fe6bc)", color: "var(--color-green-900, #123b2c)", fontWeight: 700, padding: "12px 22px", borderRadius: "var(--radius-md)" }}>시작하기</a>
            <a href="/foundations" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontWeight: 700, padding: "12px 22px", borderRadius: "var(--radius-md)" }}>Docs 보기</a>
          </div>
        </div>
        <div style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-6)", background: "var(--color-background-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }}>
            <strong>Design Tokens</strong>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)" }}>tokens.css</span>
          </div>
          {TOKENS.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "var(--spacing-3) 0", borderTop: "1px solid var(--color-background-subtle)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `var(${t.cssVar})`, border: "1px solid var(--color-border-default)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>{t.name}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 원칙 */}
      <section id="principles">
        <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 800, marginBottom: "var(--spacing-4)" }}>우리가 지키는 세 가지 원칙</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-6)" }}>
          {[
            { n: "PRINCIPLE 01", t: "Clarity first", d: "화려함보다 명확함. 사용자가 다음 행동을 고민하지 않게 합니다." },
            { n: "PRINCIPLE 02", t: "Token-driven", d: "색·간격·타이포는 전부 토큰으로. 디자인과 코드가 하나의 소스를 공유합니다." },
            { n: "PRINCIPLE 03", t: "Open by default", d: "모든 결정은 공개 문서로. 누구나 제안하고 기여할 수 있습니다." },
          ].map((p) => (
            <div key={p.n}>
              <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>{p.n}</div>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)", margin: "var(--spacing-2) 0" }}>{p.t}</div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)" }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 2카드 */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)" }}>
        <a href="/foundations" style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-6)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>디자이너로 시작하기 →</div>
          <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>Figma 라이브러리 · 템플릿 · 아이콘 세트</div>
        </a>
        <a href="/components" style={{ ...panel, padding: "var(--spacing-6)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>개발자로 시작하기 →</div>
          <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-green-300, #7fe6bc)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>$ npm install @superbase/react</div>
        </a>
      </section>

      {/* 릴리즈 타임라인 (상위 3) */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-4)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 800 }}>Releases</h2>
          <a href="/releases" style={{ color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>모든 릴리즈 보기 →</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          {releases.slice(0, 3).map((r) => (
            <div key={r.version} style={{ display: "flex", gap: "var(--spacing-4)", alignItems: "baseline" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, minWidth: 64 }}>v{r.version}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{r.title}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)" }}>{r.summary}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 빌드**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs build`
Expected: `/` 정적 생성 성공.

- [ ] **Step 3: 커밋**
```bash
git add apps/docs/app/page.tsx
git commit -m "feat(docs): 홈을 마케팅 레이아웃으로 재작성(히어로·원칙·CTA·릴리즈)"
```

---

## Phase 4 — 컴포넌트 목록

### Task 7: 목록 페이지 재작성 (그리드 + 필터 + 검색)

**Files:** Modify `apps/docs/app/components/page.tsx`

- [ ] **Step 1: app/components/page.tsx 전체 교체**
카탈로그 기반 3열 그리드 + 카테고리 필터 pill + 검색. 미니 프리뷰는 이번 범위에서 **이름 이니셜/카테고리 라벨 카드**로 단순화(실제 컴포넌트 렌더는 각기 다른 props가 필요해 과도 → YAGNI). 클라이언트 컴포넌트.
```tsx
"use client";
import { useMemo, useState } from "react";
import { catalog, categoryOrder, type Category } from "../../lib/catalog";

const STATUS_LABEL: Record<string, string> = { stable: "STABLE", updated: "UPDATED", new: "NEW" };
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  stable: { background: "var(--color-green-100, #d3f0e2)", color: "var(--color-green-700, #146d4b)" },
  updated: { background: "var(--color-amber-100, #f5eccf)", color: "var(--color-amber-700, #7a5b16)" },
  new: { background: "var(--color-green-900, #123b2c)", color: "#fff" },
};

export default function ComponentsPage() {
  const [cat, setCat] = useState<Category | "전체">("전체");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return catalog.filter((c) => {
      const byCat = cat === "전체" || c.category === cat;
      const t = q.trim().toLowerCase();
      const byQ = !t || c.name.toLowerCase().includes(t) || c.blurb.toLowerCase().includes(t);
      return byCat && byQ;
    });
  }, [cat, q]);

  const pill = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: "var(--radius-full)", fontWeight: 600, fontSize: "var(--font-size-caption)",
    border: "1px solid var(--color-border-default)", cursor: "pointer",
    background: active ? "var(--color-green-900, #123b2c)" : "var(--color-background-default)",
    color: active ? "#fff" : "var(--color-text-primary)",
  });

  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>
        COMPONENTS · {catalog.length}
      </div>
      <h1 style={{ fontSize: "var(--font-size-display)", fontWeight: 800, margin: "var(--spacing-2) 0" }}>컴포넌트</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-6)" }}>
        모든 컴포넌트는 React와 Figma에서 동일한 이름, 동일한 속성으로 제공됩니다.
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="컴포넌트 검색..."
        style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", marginBottom: "var(--spacing-4)", fontSize: "var(--font-size-body)" }}
      />

      <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginBottom: "var(--spacing-6)" }}>
        <button style={pill(cat === "전체")} onClick={() => setCat("전체")}>전체 {catalog.length}</button>
        {categoryOrder.map((c) => {
          const n = catalog.filter((x) => x.category === c).length;
          return <button key={c} style={pill(cat === c)} onClick={() => setCat(c)}>{c} {n}</button>;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--spacing-4)" }}>
        {filtered.map((c) => (
          <a key={c.slug} href={`/components/${c.slug}`} style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 120, background: "var(--color-background-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand-primary)", fontWeight: 800, fontSize: "var(--font-size-title)" }}>
              {c.name}
            </div>
            <div style={{ padding: "var(--spacing-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{c.name}</strong>
                <span style={{ ...STATUS_STYLE[c.status], padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 700 }}>{STATUS_LABEL[c.status]}</span>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>{c.blurb}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 빌드**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs build`
Expected: `/components` 성공.

- [ ] **Step 3: 커밋**
```bash
git add apps/docs/app/components/page.tsx
git commit -m "feat(docs): 컴포넌트 목록을 카탈로그 기반 그리드+필터+검색으로 재작성"
```

---

## Phase 5 — 상세 셸 (route group)

### Task 8: 상세 디렉터리를 route group으로 이동 + 그룹 사이드바 레이아웃

**Files:** Move 17 dirs `apps/docs/app/components/<slug>/` → `apps/docs/app/components/(reference)/<slug>/`; Create `apps/docs/app/components/(reference)/layout.tsx`

- [ ] **Step 1: route group 디렉터리 생성 후 17개 상세 디렉터리 이동**
```bash
cd apps/docs/app/components
mkdir -p "(reference)"
for d in avatar badge bottom-navigation button card checkbox header icon modal radio spinner stack switch tabs text textfield toast; do
  git mv "$d" "(reference)/$d"
done
cd -
```
(주의: `page.tsx`(목록)는 이동하지 않는다. `(reference)`는 URL에 영향 없음 → `/components/<slug>` 불변.)

- [ ] **Step 2: 이동으로 깊어진 상대 import 경로 수정**
상세 페이지들은 `../../../components/...`(3단계)로 docs 컴포넌트를 참조했다. route group 디렉터리가 한 단계 늘었으므로 `../../../../components/...`(4단계)로 바꿔야 한다.
Run(치환): 각 `(reference)/<slug>/page.tsx`에서 `../../../components/` → `../../../../components/`, `../../../lib/` → `../../../../lib/`.
```bash
grep -rln '\.\./\.\./\.\./' apps/docs/app/components/\(reference\) | while read f; do
  perl -pi -e 's{\.\./\.\./\.\./}{../../../../}g' "$f"
done
```
(route group `(reference)`는 경로 세그먼트로 계산되지 않지만 파일시스템 상 실제 디렉터리이므로 상대경로는 한 단계 깊어진다. 이동 후 반드시 typecheck로 확인.)

- [ ] **Step 3: (reference)/layout.tsx 작성 (그룹 사이드바)**
```tsx
import type { ReactNode } from "react";
import { catalog, categoryOrder } from "../../../lib/catalog";

export default function ReferenceLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "var(--spacing-8)", alignItems: "start" }}>
      <aside style={{ position: "sticky", top: 80 }}>
        {categoryOrder.map((cat) => {
          const items = catalog.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: "var(--spacing-4)" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-secondary)", textTransform: "uppercase", marginBottom: "var(--spacing-2)" }}>{cat}</div>
              {items.map((c) => (
                <a key={c.slug} href={`/components/${c.slug}`} style={{ display: "block", padding: "6px 0", fontSize: "var(--font-size-caption)", color: "var(--color-text-primary)" }}>{c.name}</a>
              ))}
            </div>
          );
        })}
      </aside>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
```
(활성 링크 강조는 클라이언트 usePathname이 필요하지만, 레이아웃을 서버 컴포넌트로 단순 유지하기 위해 이번엔 생략 — YAGNI. 필요 시 후속.)

- [ ] **Step 4: 타입체크 + 빌드**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs build`
Expected: 통과. 상세 17종 라우트가 `/components/<slug>`로 생성되고 좌측 그룹 사이드바가 붙음. 목록 `/components`는 사이드바 없이 유지.

- [ ] **Step 5: URL 불변 확인**
Run: `pnpm --filter @superbase/docs build 2>&1 | grep -E '/components/(button|header|toast)'`
Expected: `/components/button`, `/components/header`, `/components/toast` 등 기존 URL 그대로.

- [ ] **Step 6: 커밋**
```bash
git add apps/docs/app/components
git commit -m "feat(docs): 상세 페이지를 route group으로 이동 + 그룹 사이드바 레이아웃"
```

---

## Phase 6 — Button 강화

### Task 9: Button 상세에 Variants 표 + Do/Don't 추가

**Files:** Modify `apps/docs/app/components/(reference)/button/page.tsx`

기존 Web/RN 플랫폼 탭은 유지하고, `ComponentDoc` children 안(탭 아래)에 Variants 표와 Do/Don't 카드를 추가한다.

- [ ] **Step 1: Button page.tsx의 `<Tabs .../>` 뒤에 Variants + Do/Don't 삽입**
`export default function ButtonPage()`의 `<Tabs ... />` 다음, `</ComponentDoc>` 앞에 아래를 추가:
```tsx
      <section style={{ marginTop: "var(--spacing-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 800, marginBottom: "var(--spacing-4)" }}>Variants</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-caption)" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--color-border-default)" }}>
              <th style={{ padding: "var(--spacing-3)" }}>variant</th>
              <th style={{ padding: "var(--spacing-3)" }}>용도</th>
              <th style={{ padding: "var(--spacing-3)" }}>토큰</th>
            </tr>
          </thead>
          <tbody>
            {[
              { v: "primary", u: "화면의 핵심 행동 (1개만)", t: "brand.primary" },
              { v: "secondary", u: "보조 행동", t: "green.100" },
              { v: "outline", u: "낮은 강조 · 취소/닫기", t: "border.default" },
              { v: "ghost", u: "최소 강조 · 인라인 액션", t: "transparent" },
              { v: "danger", u: "삭제 등 파괴적 행동", t: "status.danger" },
            ].map((r) => (
              <tr key={r.v} style={{ borderBottom: "1px solid var(--color-background-subtle)" }}>
                <td style={{ padding: "var(--spacing-3)", fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>{r.v}</td>
                <td style={{ padding: "var(--spacing-3)", color: "var(--color-text-secondary)" }}>{r.u}</td>
                <td style={{ padding: "var(--spacing-3)", fontFamily: "ui-monospace, monospace", color: "var(--color-text-secondary)" }}>{r.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "var(--spacing-8)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)" }}>
        <div style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)" }}>
          <div style={{ display: "flex", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
            <WebButton variant="primary">가입하기</WebButton>
            <WebButton variant="outline">둘러보기</WebButton>
          </div>
          <div style={{ fontSize: "var(--font-size-caption)" }}><strong style={{ color: "var(--color-status-success)" }}>✔ Do</strong> Primary는 화면당 하나. 나머지는 낮은 강조로.</div>
        </div>
        <div style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)" }}>
          <div style={{ display: "flex", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
            <WebButton variant="primary">가입하기</WebButton>
            <WebButton variant="primary">둘러보기</WebButton>
          </div>
          <div style={{ fontSize: "var(--font-size-caption)" }}><strong style={{ color: "var(--color-status-danger)" }}>✘ Don't</strong> Primary 버튼을 나란히 두 개 쓰지 않습니다.</div>
        </div>
      </section>
```
(참고: `danger` variant가 실제 `@superbase/react` Button에 없으면 표에서 `danger` 행을 제거하거나, 실제 지원 variant(primary/secondary/outline/ghost)에만 맞춘다. Step 2에서 확인.)

- [ ] **Step 2: 실제 Button variant와 표 일치 확인**
Run: `grep -rn "variant" packages/react/src/Button/*.tsx | grep -iE "primary|secondary|outline|ghost|danger" | head`
Expected: 표의 variant 목록을 실제 지원값에 맞춘다(미지원 행 제거). `danger` 미지원이면 표에서 제외.

- [ ] **Step 3: 타입체크 + 빌드 + 커밋**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs build`
Expected: `/components/button` 성공.
```bash
git add "apps/docs/app/components/(reference)/button/page.tsx"
git commit -m "feat(docs): Button 상세에 Variants 표 + Do/Don't 추가"
```

---

## Phase 7 — 릴리즈 페이지

### Task 10: /releases 페이지

**Files:** Create `apps/docs/app/releases/page.tsx`

- [ ] **Step 1: app/releases/page.tsx 작성**
```tsx
import { releases } from "../../lib/releases";

export default function ReleasesPage() {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>RELEASES</div>
      <h1 style={{ fontSize: "var(--font-size-display)", fontWeight: 800, margin: "var(--spacing-2) 0 var(--spacing-6)" }}>릴리즈</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {releases.map((r) => (
          <div key={r.version} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: "var(--spacing-4)", paddingBottom: "var(--spacing-6)", borderBottom: "1px solid var(--color-border-default)" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700 }}>v{r.version}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>{r.title}</div>
              <p style={{ color: "var(--color-text-secondary)", marginTop: "var(--spacing-2)" }}>{r.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크 + 빌드 + 커밋**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs build`
Expected: `/releases` 정적 생성.
```bash
git add apps/docs/app/releases/page.tsx
git commit -m "feat(docs): 릴리즈 페이지(/releases) 추가"
```

---

## Phase 8 — 정리 + 최종 검증

### Task 11: 전체 검증

- [ ] **Step 1: docs 전체 typecheck + test + build**
Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs test && pnpm --filter @superbase/docs build`
Expected: 모두 통과. 라우트 목록에 `/`, `/components`, `/components/<17종>`, `/releases`, `/foundations` 존재.

- [ ] **Step 2: 저장소 전체 검증**
Run: `pnpm turbo run typecheck test build`
Expected: 전체 PASS.

- [ ] **Step 3: 육안 검증 (dev 서버)**
Run: `pnpm --filter @superbase/docs exec next dev -p 3100`
확인: 홈(히어로/원칙/CTA/릴리즈) · 목록(필터·검색·3열·status 뱃지) · 상세(그룹 사이드바 + Web/RN 탭) · Button(Variants·Do/Don't) · /releases · 그린 푸터 · 다크모드 토글 · 상세 URL 불변.

- [ ] **Step 4: 잔여 참조/데드코드 확인**
Run: `grep -rn "AppShell\|SideNav" apps/docs`
Expected: 출력 없음.

---

## Self-Review

- **스펙 커버리지**: SiteHeader/Footer(T1-2), layout 교체·AppShell 제거(T3), catalog(T4), releases(T5), 홈(T6), 목록(T7), 상세 route group·사이드바(T8), Button 강화(T9), /releases(T10), 검증(T11). 스펙 전 페이지·데이터 매핑됨.
- **의도적 편차**: 상세 탭은 Web/RN 유지(디자인/코드/접근성 아님) — 플랜 헤더에 명시. 목록 미니 프리뷰는 이름 카드로 단순화(YAGNI) — 실제 컴포넌트 렌더는 후속.
- **Placeholder 스캔**: 모든 스텝 실제 코드 포함. Figma/Changelog 링크만 의도적 `#`(스펙 스코프아웃).
- **타입 일관성**: `CatalogItem{slug,name,category,status,blurb}` / `Category` union / `Release{version,title,summary}`가 catalog.ts·releases.ts 정의와 page.tsx·layout.tsx 사용에서 일치.
- **리스크**: T8의 상대경로 치환(3단계→4단계)이 핵심 — 이동 직후 typecheck 필수. route group 디렉터리명 `(reference)`는 셸/커밋 시 괄호 이스케이프 주의.
