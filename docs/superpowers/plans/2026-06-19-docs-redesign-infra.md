# Plan 7 — 문서 인프라 + Button 페이지 (문서 리디자인) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 문서 사이트에 재사용 문서 프리미티브(Code/CodeBlock/Example/ComponentDoc)와 컴포넌트별 사이드바 네비를 만들고, `/components` 인덱스 + 레퍼런스 Button 페이지(`/components/button`)를 구현한다.

**Architecture:** `apps/docs/components/docs/`에 문서 프리미티브를 둔다. `CodeBlock`은 `prism-react-renderer`로 하이라이팅 + 클립보드 복사(클라이언트). `Example`은 설명 + 라이브 프리뷰 캔버스 + (약간 간격) + `CodeBlock`. 사이드바는 `componentNav` 데이터를 단일 소스로 9개 컴포넌트를 나열하고 `usePathname`으로 활성 표시(`SideNav`, 클라이언트). `/components`는 인덱스 그리드, `/components/button`은 프리미티브로 만든 첫 컴포넌트 페이지.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, prism-react-renderer 2, CSS Modules, Vitest + jsdom + Testing Library.

> 전제: `apps/docs` 동작 중. `app/components/page.tsx`는 현재 평면 쇼케이스(`"use client"`)다 — 이 플랜에서 인덱스로 대체. AppShell은 서버 컴포넌트로 inline NAV 배열 + 사이드바를 가짐(ThemeToggle은 클라이언트 자식). `@superbase/react`는 Text/Button/Stack 등 export(번들 전체 `"use client"`). Node 22, pnpm 10.27.0. 단일 vite 5 핀.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `apps/docs/components/docs/componentNav.ts` (+ `.test.ts`) | 컴포넌트 목록 단일 소스 |
| `apps/docs/components/docs/Code.tsx` + `Code.module.css` | 인라인 코드 칩 |
| `apps/docs/components/docs/CodeBlock.tsx` + `.module.css` (+ `.test.tsx`) | 하이라이팅 코드블록 + 복사 |
| `apps/docs/components/docs/Example.tsx` + `.module.css` (+ `.test.tsx`) | 예시 섹션(설명+프리뷰+코드) |
| `apps/docs/components/docs/ComponentDoc.tsx` + `.module.css` | 페이지 틀(제목+리드) |
| `apps/docs/components/SideNav.tsx` + `.module.css` (+ `.test.tsx`) | 사이드바 네비(컴포넌트 그룹 + 활성) |
| `apps/docs/components/AppShell.tsx` (수정) | inline nav 제거 → `<SideNav/>` |
| `apps/docs/app/components/page.tsx` (수정) | 인덱스 그리드 |
| `apps/docs/app/components/button/page.tsx` | Button 컴포넌트 페이지 |

---

## Task 1: prism 설치 + componentNav + Code

**Files:** Modify `apps/docs/package.json`; Create `apps/docs/components/docs/componentNav.ts`, `componentNav.test.ts`, `Code.tsx`, `Code.module.css`

- [ ] **Step 1: `apps/docs/package.json`의 dependencies에 prism 추가**

`"dependencies"` 객체에서 `"next": "^15.1.0",` 위(알파벳 순 무관, 객체 내 아무 위치)에 한 줄 추가:
```json
    "prism-react-renderer": "^2.4.0",
```

- [ ] **Step 2: 설치**

Run: `pnpm install`
Expected: `prism-react-renderer` 설치됨. 해석된 버전 보고.

- [ ] **Step 3: 실패 테스트 — `apps/docs/components/docs/componentNav.test.ts`**

```ts
import { componentNav } from "./componentNav";

describe("componentNav", () => {
  it("lists the 9 components with slug + label", () => {
    expect(componentNav).toHaveLength(9);
    expect(componentNav.map((c) => c.slug)).toContain("button");
    for (const c of componentNav) {
      expect(c.slug.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./componentNav` 없음).

- [ ] **Step 5: `apps/docs/components/docs/componentNav.ts`**

```ts
export interface ComponentNavItem {
  slug: string;
  label: string;
}

export const componentNav: ComponentNavItem[] = [
  { slug: "badge", label: "Badge" },
  { slug: "button", label: "Button" },
  { slug: "checkbox", label: "Checkbox" },
  { slug: "radio", label: "Radio" },
  { slug: "spinner", label: "Spinner" },
  { slug: "stack", label: "Stack" },
  { slug: "switch", label: "Switch" },
  { slug: "text", label: "Text" },
  { slug: "textfield", label: "TextField" },
];
```

- [ ] **Step 6: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS.

- [ ] **Step 7: `apps/docs/components/docs/Code.module.css`**

```css
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875em;
  background: var(--color-background-subtle);
  color: var(--color-text-primary);
  border-radius: 6px;
  padding: 2px 6px;
}
```

- [ ] **Step 8: `apps/docs/components/docs/Code.tsx`**

```tsx
import type { ReactNode } from "react";
import styles from "./Code.module.css";

export function Code({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}
```

- [ ] **Step 9: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/package.json apps/docs/components/docs/componentNav.ts apps/docs/components/docs/componentNav.test.ts apps/docs/components/docs/Code.tsx apps/docs/components/docs/Code.module.css pnpm-lock.yaml
git commit -m "feat(docs): add componentNav data and Code chip + prism dep"
```

---

## Task 2: CodeBlock (하이라이팅 + 복사, TDD)

**Files:** Create `apps/docs/components/docs/CodeBlock.tsx`, `CodeBlock.module.css`, `CodeBlock.test.tsx`

- [ ] **Step 1: 실패 테스트 — `CodeBlock.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("renders the code text (tokenized)", () => {
    const { container } = render(<CodeBlock code={`<Button>확인</Button>`} />);
    expect(container.textContent).toContain("Button");
    expect(container.textContent).toContain("확인");
  });

  it("copies the code to the clipboard on copy-button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodeBlock code={`const a = 1;`} />);
    await userEvent.click(screen.getByRole("button", { name: /복사/ }));
    expect(writeText).toHaveBeenCalledWith("const a = 1;");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./CodeBlock` 없음).

- [ ] **Step 3: `CodeBlock.module.css`**

```css
.wrap { border-radius: 12px; overflow: hidden; }
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f1620;
  color: #8b95a1;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 8px 16px;
}
.copy { background: none; border: none; color: #8b95a1; font: inherit; cursor: pointer; }
.copy:hover { color: #e5e8eb; }
.pre {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

- [ ] **Step 4: `CodeBlock.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import styles from "./CodeBlock.module.css";

export interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span>CODE</span>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre className={styles.pre} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS.

> 검증/적응: prism-react-renderer 2.x API는 `import { Highlight, themes }` + render-prop이다. 만약 설치된 버전 API가 다르면(예: 1.x의 default export `Highlight` + `defaultProps`), 실제 API에 맞춰 조정하되 의도(코드 하이라이팅 렌더)는 유지하고 보고하라. 클립보드 테스트가 jsdom에서 `navigator.clipboard` 미정의로 실패하면 위처럼 `Object.assign(navigator, { clipboard: { writeText } })`로 mock한다(테스트에 이미 포함).

- [ ] **Step 6: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/components/docs/CodeBlock.tsx apps/docs/components/docs/CodeBlock.module.css apps/docs/components/docs/CodeBlock.test.tsx
git commit -m "feat(docs): add CodeBlock with prism highlighting + copy"
```

---

## Task 3: Example + ComponentDoc (TDD)

**Files:** Create `apps/docs/components/docs/Example.tsx`, `Example.module.css`, `Example.test.tsx`, `ComponentDoc.tsx`, `ComponentDoc.module.css`

- [ ] **Step 1: 실패 테스트 — `Example.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { Example } from "./Example";

describe("Example", () => {
  it("renders the live preview, the title/description, and the code", () => {
    const { container } = render(
      <Example title="기본" description="설명입니다" code={`<Button>확인</Button>`}>
        <button>확인</button>
      </Example>,
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
    expect(container.textContent).toContain("Button");
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./Example` 없음).

- [ ] **Step 3: `Example.module.css`** (프리뷰와 코드 사이 약간 간격 = `.codeGap` margin-top)

```css
.example { margin-top: var(--spacing-8); }
.title { font-size: var(--font-size-title); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; }
.desc { font-size: var(--font-size-body); color: var(--color-text-secondary); line-height: 1.7; margin: var(--spacing-2) 0 0; }
.canvas {
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  margin-top: var(--spacing-4);
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}
.codeGap { margin-top: var(--spacing-3); }
```

- [ ] **Step 4: `Example.tsx`**

```tsx
import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import styles from "./Example.module.css";

export interface ExampleProps {
  title?: string;
  description?: ReactNode;
  code: string;
  children: ReactNode;
}

export function Example({ title, description, code, children }: ExampleProps) {
  return (
    <section className={styles.example}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {description ? <p className={styles.desc}>{description}</p> : null}
      <div className={styles.canvas}>{children}</div>
      <div className={styles.codeGap}>
        <CodeBlock code={code} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS.

- [ ] **Step 6: `ComponentDoc.module.css`**

```css
.title { font-size: var(--font-size-display); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; }
.lead { font-size: var(--font-size-body); color: var(--color-text-secondary); margin: var(--spacing-2) 0 0; line-height: 1.6; }
```

- [ ] **Step 7: `ComponentDoc.tsx`**

```tsx
import type { ReactNode } from "react";
import styles from "./ComponentDoc.module.css";

export interface ComponentDocProps {
  title: string;
  lead: string;
  children: ReactNode;
}

export function ComponentDoc({ title, lead, children }: ComponentDocProps) {
  return (
    <article>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
      {children}
    </article>
  );
}
```

- [ ] **Step 8: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/components/docs/Example.tsx apps/docs/components/docs/Example.module.css apps/docs/components/docs/Example.test.tsx apps/docs/components/docs/ComponentDoc.tsx apps/docs/components/docs/ComponentDoc.module.css
git commit -m "feat(docs): add Example section + ComponentDoc shell"
```

---

## Task 4: SideNav + AppShell 배선 (TDD)

**Files:** Create `apps/docs/components/SideNav.tsx`, `SideNav.module.css`, `SideNav.test.tsx`; Modify `apps/docs/components/AppShell.tsx`

- [ ] **Step 1: 실패 테스트 — `SideNav.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SideNav } from "./SideNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/components/button" }));

describe("SideNav", () => {
  it("lists all 9 component links", () => {
    render(<SideNav />);
    for (const label of [
      "Badge", "Button", "Checkbox", "Radio", "Spinner",
      "Stack", "Switch", "Text", "TextField",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current component link active", () => {
    render(<SideNav />);
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `pnpm --filter @superbase/docs test` → FAIL (`./SideNav` 없음).

- [ ] **Step 3: `SideNav.module.css`**

```css
.nav { display: flex; flex-direction: column; gap: 2px; margin-top: var(--spacing-6); }
.link, .group {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 7px 8px;
  border-radius: 8px;
}
.group {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--spacing-3);
}
.item {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 6px 8px 6px 18px;
  border-radius: 8px;
}
.link[data-active="true"],
.item[data-active="true"] {
  color: var(--color-brand-primary);
  font-weight: var(--font-weight-bold);
  background: var(--color-background-subtle);
}
```

- [ ] **Step 4: `SideNav.tsx`**

```tsx
"use client";
import { usePathname } from "next/navigation";
import { componentNav } from "./docs/componentNav";
import styles from "./SideNav.module.css";

const TOP = [
  { href: "/", label: "Getting Started" },
  { href: "/foundations", label: "Foundations" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      {TOP.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={styles.link}
          data-active={pathname === item.href}
        >
          {item.label}
        </a>
      ))}
      <a href="/components" className={styles.group} data-active={pathname === "/components"}>
        Components
      </a>
      {componentNav.map((item) => {
        const href = `/components/${item.slug}`;
        return (
          <a
            key={item.slug}
            href={href}
            className={styles.item}
            data-active={pathname === href}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `pnpm --filter @superbase/docs test` → PASS.

- [ ] **Step 6: `AppShell.tsx` 전체를 아래로 교체** (inline NAV 제거, `<SideNav/>` 사용)

```tsx
import type { ReactNode } from "react";
import { Text } from "@superbase/react";
import { SideNav } from "./SideNav";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          borderRight: "1px solid var(--color-border-default)",
          padding: "var(--spacing-6)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Text as="div" variant="title" weight="bold">
          Superbase
        </Text>
        <SideNav />
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-4) var(--spacing-8)",
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          <Text variant="caption" color="secondary">
            다크 모드
          </Text>
          <ThemeToggle />
        </header>
        <main style={{ padding: "var(--spacing-8)", flex: 1, maxWidth: 880 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: 빌드 + typecheck + commit**

Run: `pnpm turbo run build --filter=@superbase/docs` → `next build` 성공.
Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/components/SideNav.tsx apps/docs/components/SideNav.module.css apps/docs/components/SideNav.test.tsx apps/docs/components/AppShell.tsx
git commit -m "feat(docs): sidebar lists each component with active state"
```

---

## Task 5: /components 인덱스 + Button 페이지 + 전체 검증

**Files:** Modify `apps/docs/app/components/page.tsx`; Create `apps/docs/app/components/button/page.tsx`

- [ ] **Step 1: `apps/docs/app/components/page.tsx` 전체를 인덱스 그리드로 교체**

```tsx
import { Text } from "@superbase/react";
import { componentNav } from "../../components/docs/componentNav";

export default function ComponentsIndexPage() {
  return (
    <div>
      <Text as="h1" variant="display" weight="bold">
        Components
      </Text>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "var(--spacing-4)",
          marginTop: "var(--spacing-6)",
        }}
      >
        {componentNav.map((c) => (
          <a
            key={c.slug}
            href={`/components/${c.slug}`}
            style={{
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-4)",
              display: "block",
            }}
          >
            <Text variant="title" weight="bold">
              {c.label}
            </Text>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `apps/docs/app/components/button/page.tsx` 작성**

```tsx
"use client";
import { Button } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function ButtonPage() {
  return (
    <ComponentDoc
      title="Button"
      lead="사용자의 액션을 유도하는 기본 버튼. variant·size·disabled를 지원합니다."
    >
      <Example
        title="기본 사용"
        description={
          <>
            <Code>variant</Code>로 스타일을 정합니다. <Code>primary</Code>는 주요
            액션, <Code>secondary</Code>는 보조 액션에 씁니다.
          </>
        }
        code={`<Button variant="primary">확인</Button>\n<Button variant="secondary">취소</Button>`}
      >
        <Button variant="primary">확인</Button>
        <Button variant="secondary">취소</Button>
      </Example>

      <Example
        title="크기 조정하기"
        description={
          <>
            <Code>size</Code>로 크기를 바꿉니다. <Code>sm</Code>, <Code>md</Code>,{" "}
            <Code>lg</Code> 중 하나를 고를 수 있어요.
          </>
        }
        code={`<Button size="sm">Small</Button>\n<Button size="md">Medium</Button>\n<Button size="lg">Large</Button>`}
      >
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Example>

      <Example
        title="비활성"
        description={
          <>
            <Code>disabled</Code>로 버튼을 비활성화합니다.
          </>
        }
        code={`<Button disabled>비활성</Button>`}
      >
        <Button disabled>비활성</Button>
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 3: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: tokens·react·react-native·docs 전부 통과. docs `next build`의 라우트 표에 `/components`(인덱스)와 `/components/button`이 모두 나타난다. docs 테스트 증가(기존 6 + componentNav 1 + CodeBlock 2 + Example 1 + SideNav 2 = 12). 실제 수치 보고.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/app/components/page.tsx apps/docs/app/components/button
git commit -m "feat(docs): components index grid + Button reference page"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 전부 통과한다.
- 사이드바가 9개 컴포넌트를 개별 링크로 나열하고 현재 페이지를 활성 표시한다.
- `/components`는 인덱스 그리드, `/components/button`은 설명+프리뷰+하이라이팅 코드+복사로 구성된 페이지다.
- 프리뷰와 코드 사이에 약간의 간격(`--spacing-3`)이 있다.
- 문서 프리미티브(Code/CodeBlock/Example/ComponentDoc/SideNav/componentNav)가 재사용 가능하게 분리되어 있다.

## 다음 플랜

- **Plan 8**: 나머지 8개 컴포넌트 페이지(Badge/Checkbox/Radio/Spinner/Stack/Switch/Text/TextField)를 동일 프리미티브로 작성. 각 페이지 라우트 빌드 확인.
