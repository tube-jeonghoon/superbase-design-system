# 컴포넌트 목록 카드 미리보기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/components` 그리드 카드의 텍스트 플레이스홀더를 각 컴포넌트의 실제 축소 렌더링(대표 인스턴스 1개)으로 교체한다.

**Architecture:** `slug → ReactNode` 프리뷰 레지스트리 한 파일 + 표준 프레임 래퍼 하나. 그리드 페이지는 `previews[slug]`만 렌더한다. 17개 중 13개는 `@superbase/react` 실컴포넌트, 4개(Modal/Toast/Header/BottomNavigation)는 포털·명령형 API·전체너비 제약 때문에 토큰 기반 정적 미니어처.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, Vitest + jsdom + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-07-08-component-card-previews-design.md`

---

## 핵심 제약 (구현 전 반드시 읽을 것)

1. **`inert`가 필수다.** 카드 전체가 `<a href>` 링크다. 미리보기 안에는 `<button tabIndex=0>`인 Tab·Checkbox·Switch·Radio·Button이 들어간다. `pointer-events: none`은 클릭만 막고 **탭 순서에는 남는다** → 카드 17개가 키보드 탭 순서를 오염시키고 스크린리더에 중복 노출된다. `PreviewFrame`이 `inert`를 걸어 포인터·탭 순서·접근성 트리에서 한 번에 제거한다. React 19가 `inert` boolean prop을 지원한다.

2. **컴포넌트가 전부 controlled다.** `defaultChecked`/`defaultValue`가 **없다**. 반드시 이 시그니처를 지킬 것:
   - `Checkbox`: `checked` **필수**, 라벨은 `label` prop (children 아님)
   - `Switch`: `checked` **필수**
   - `RadioGroup`: `value` **필수** / `Radio`: `value` 필수, 라벨은 `label` prop
   - `Tabs`: `value` **필수**, `TabList` + `Tab` 조합
   - `TextField`: `value` + `onChange(value: string)` (표준 이벤트 아님)
   - `Stack`: `gap`은 `SpacingScale` = `0|1|2|3|4|6|8` — **5·7은 없다**
   - `Card`: `padding`도 같은 스케일

3. **사용 가능한 아이콘 24종:** `arrow-left bell calendar chat check chevron-up chevron-down chevron-left chevron-right close error heart home info menu minus plus search settings star success user users warning`

4. **CSS 변수는 시맨틱 토큰만 쓴다** (`--color-brand-primary`, `--color-background-default/subtle`, `--color-border-default`, `--color-text-primary/secondary`, `--color-status-success/danger`, `--color-background-scrim`, `--radius-sm/md/lg/full`, `--spacing-1..4,6,8`, `--shadow-sm/md/lg`, `--font-size-caption`). primitive(`--color-green-500` 등) 직접 참조 금지.

---

## File Structure

**Create:**
- `apps/docs/components/site/PreviewFrame.tsx` — 120px 프레임 래퍼. 책임: 크기·중앙정렬·배경·`inert`. 프리뷰 내용은 모른다.
- `apps/docs/components/site/PreviewFrame.module.css`
- `apps/docs/components/site/PreviewFrame.test.tsx`
- `apps/docs/components/site/previews.tsx` — 레지스트리 + 미니어처 4종 로컬 컴포넌트. 책임: "각 카드가 무엇을 보여주는가".
- `apps/docs/components/site/previews.module.css`
- `apps/docs/components/site/previews.test.tsx` — 커버리지 + 스모크 렌더

**Modify:**
- `apps/docs/app/components/page.tsx:59-62` — 텍스트 플레이스홀더를 `<PreviewFrame>{previews[c.slug]}</PreviewFrame>`로 교체

---

## Task 1: PreviewFrame

**Files:**
- Create: `apps/docs/components/site/PreviewFrame.tsx`
- Create: `apps/docs/components/site/PreviewFrame.module.css`
- Test: `apps/docs/components/site/PreviewFrame.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

`apps/docs/components/site/PreviewFrame.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PreviewFrame } from "./PreviewFrame";

describe("PreviewFrame", () => {
  it("children을 렌더한다", () => {
    render(<PreviewFrame><button type="button">클릭</button></PreviewFrame>);
    expect(screen.getByRole("button", { name: "클릭" })).toBeInTheDocument();
  });

  it("inert를 걸어 내부 인터랙티브 요소를 탭 순서·접근성 트리에서 제거한다", () => {
    const { container } = render(
      <PreviewFrame><button type="button">클릭</button></PreviewFrame>,
    );
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.hasAttribute("inert")).toBe(true);
  });
});
```

> 참고: jsdom은 `inert`의 *동작*(포커스 차단)을 구현하지 않는다. 그래서 속성이 붙었는지만 단언한다. 실제 차단 동작은 Task 5의 브라우저 검수에서 확인한다.

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/docs test -- PreviewFrame`
Expected: FAIL — `Failed to resolve import "./PreviewFrame"`

- [ ] **Step 3: CSS 모듈 작성**

`apps/docs/components/site/PreviewFrame.module.css`:

```css
.frame {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-background-subtle);
  /* inert가 이미 포인터를 막지만 이중 안전장치로 둔다 */
  pointer-events: none;
}
```

- [ ] **Step 4: 컴포넌트 작성**

`apps/docs/components/site/PreviewFrame.tsx`:

```tsx
import type { ReactNode } from "react";
import styles from "./PreviewFrame.module.css";

export interface PreviewFrameProps {
  children: ReactNode;
}

/**
 * 컴포넌트 목록 카드의 미리보기 영역.
 *
 * 카드 전체가 <a> 링크이고 미리보기 안에는 tabIndex=0인 버튼(Tab/Checkbox/Switch 등)이
 * 들어간다. pointer-events:none은 클릭만 막고 탭 순서에는 남으므로, inert로 포인터·탭
 * 순서·접근성 트리에서 한 번에 제거한다.
 */
export function PreviewFrame({ children }: PreviewFrameProps) {
  return (
    <div className={styles.frame} inert>
      {children}
    </div>
  );
}
```

> `inert`는 React 19에서 boolean prop이다. 타입 에러가 나면 `@types/react`가 19인지 확인할 것(`apps/docs/package.json`에 `^19.0.0`).

- [ ] **Step 5: 테스트 통과 확인**

Run: `pnpm --filter @superbase/docs test -- PreviewFrame`
Expected: PASS (2 tests)

- [ ] **Step 6: 커밋**

```bash
git add apps/docs/components/site/PreviewFrame.tsx apps/docs/components/site/PreviewFrame.module.css apps/docs/components/site/PreviewFrame.test.tsx
git commit -m "feat(docs): PreviewFrame — 카드 미리보기 표준 프레임(inert)"
```

---

## Task 2: 프리뷰 레지스트리 — 커버리지 테스트 먼저

**Files:**
- Create: `apps/docs/components/site/previews.test.tsx`

- [ ] **Step 1: 실패하는 커버리지 테스트 작성**

`apps/docs/components/site/previews.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { catalog } from "../../lib/catalog";
import { previews } from "./previews";

describe("previews", () => {
  it("catalog의 모든 slug에 미리보기가 있고, 남는 미리보기가 없다", () => {
    expect(new Set(Object.keys(previews))).toEqual(new Set(catalog.map((c) => c.slug)));
  });

  it("모든 미리보기가 예외 없이 렌더된다", () => {
    for (const item of catalog) {
      expect(() => render(<>{previews[item.slug]}</>), item.slug).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `pnpm --filter @superbase/docs test -- previews`
Expected: FAIL — `Failed to resolve import "./previews"`

- [ ] **Step 3: 커밋 안 함 — Task 3에서 구현과 함께 커밋한다**

이 테스트는 Task 3의 구현 없이는 통과할 수 없다. 실패 상태로 남겨두고 바로 Task 3으로 간다.

---

## Task 3: 프리뷰 레지스트리 구현 (17개)

**Files:**
- Create: `apps/docs/components/site/previews.module.css`
- Create: `apps/docs/components/site/previews.tsx`
- Test: `apps/docs/components/site/previews.test.tsx` (Task 2에서 작성됨)

- [ ] **Step 1: CSS 모듈 작성**

`apps/docs/components/site/previews.module.css`:

```css
/* ── 공용 ── */
.w220 {
  width: 220px;
}

/* Stack 미리보기용 데코 박스 */
.stackBox {
  width: 20px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-brand-primary);
}
.stackBox:nth-child(2) { opacity: 0.66; }
.stackBox:nth-child(3) { opacity: 0.33; }

/* ── Toast 미니어처 ── */
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-background-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: var(--font-size-caption);
  color: var(--color-text-primary);
}
.toastIcon {
  display: flex;
  color: var(--color-status-success);
}

/* ── Modal 미니어처 ── */
.modalScrim {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-scrim);
}
.modalPanel {
  width: 68%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background: var(--color-background-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.modalTitle {
  height: 10px;
  width: 52%;
  border-radius: var(--radius-full);
  background: var(--color-text-primary);
}
.modalLine {
  height: 6px;
  width: 80%;
  border-radius: var(--radius-full);
  background: var(--color-border-default);
}
.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  margin-top: var(--spacing-1);
}
.modalBtnGhost {
  width: 36px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-default);
}
.modalBtnPrimary {
  width: 36px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--color-brand-primary);
}

/* ── Header 미니어처 ── */
.headerBar {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  background: var(--color-background-default);
  border-top: 1px solid var(--color-border-default);
  border-bottom: 1px solid var(--color-border-default);
  font-size: var(--font-size-caption);
  font-weight: 700;
  color: var(--color-text-primary);
}
.headerBell {
  display: flex;
  color: var(--color-text-secondary);
}

/* ── BottomNavigation 미니어처 ── */
.bottomBar {
  width: 100%;
  height: 60px;
  display: flex;
  background: var(--color-background-default);
  border-top: 1px solid var(--color-border-default);
}
.bottomItem {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  color: var(--color-text-secondary);
}
.bottomItemActive {
  color: var(--color-brand-primary);
}
```

- [ ] **Step 2: 레지스트리 작성**

`apps/docs/components/site/previews.tsx`:

```tsx
"use client";
import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Icon,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  TextField,
} from "@superbase/react";
import styles from "./previews.module.css";

const noop = () => {};

/* ─────────── 미니어처 4종 ───────────
 * Modal(포털)·Toast(명령형 useToast)·Header/BottomNavigation(전체 너비)은
 * 120px 카드 안에 실물을 렌더할 수 없다. 시맨틱 토큰만으로 정적 재현한다.
 * 토큰을 쓰므로 색·모서리가 실물과 일치하고 다크 모드도 자동 반영된다.
 */

function ToastMini() {
  return (
    <div className={styles.toast}>
      <span className={styles.toastIcon}>
        <Icon name="success" size="sm" />
      </span>
      저장되었습니다
    </div>
  );
}

function ModalMini() {
  return (
    <div className={styles.modalScrim}>
      <div className={styles.modalPanel}>
        <div className={styles.modalTitle} />
        <div className={styles.modalLine} />
        <div className={styles.modalActions}>
          <span className={styles.modalBtnGhost} />
          <span className={styles.modalBtnPrimary} />
        </div>
      </div>
    </div>
  );
}

function HeaderMini() {
  return (
    <div className={styles.headerBar}>
      <span>Superbase</span>
      <span className={styles.headerBell}>
        <Icon name="bell" size="sm" />
      </span>
    </div>
  );
}

function BottomNavMini() {
  const items = [
    { icon: "home", label: "홈", active: true },
    { icon: "search", label: "검색", active: false },
    { icon: "user", label: "프로필", active: false },
  ] as const;
  return (
    <div className={styles.bottomBar}>
      {items.map((it) => (
        <div
          key={it.label}
          className={[styles.bottomItem, it.active ? styles.bottomItemActive : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon name={it.icon} size="sm" />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────── 레지스트리 ───────────
 * 키는 lib/catalog.ts의 slug와 1:1 대응한다(previews.test.tsx가 강제).
 * 카드당 대표 인스턴스 1개만 — variant 나열 금지.
 * 모든 컴포넌트가 controlled라 고정값 + no-op 핸들러를 넘긴다.
 * PreviewFrame이 inert를 걸어 상호작용은 애초에 불가능하다.
 */
export const previews: Record<string, ReactNode> = {
  button: <Button variant="primary">확인</Button>,

  textfield: (
    <div className={styles.w220}>
      <TextField placeholder="이메일" value="" onChange={noop} />
    </div>
  ),

  checkbox: <Checkbox checked label="동의합니다" />,

  radio: (
    <RadioGroup value="a" aria-label="미리보기">
      <Radio value="a" label="선택됨" />
    </RadioGroup>
  ),

  switch: <Switch checked aria-label="미리보기" />,

  toast: <ToastMini />,

  modal: <ModalMini />,

  spinner: <Spinner size="lg" />,

  badge: <Badge variant="brand">NEW</Badge>,

  tabs: (
    <Tabs value="design">
      <TabList aria-label="미리보기">
        <Tab value="design">디자인</Tab>
        <Tab value="code">코드</Tab>
      </TabList>
    </Tabs>
  ),

  header: <HeaderMini />,

  "bottom-navigation": <BottomNavMini />,

  stack: (
    <Stack direction="row" gap={2}>
      <span className={styles.stackBox} />
      <span className={styles.stackBox} />
      <span className={styles.stackBox} />
    </Stack>
  ),

  card: (
    <Card elevation="sm" padding={3}>
      <Text variant="caption" weight="medium">Card</Text>
    </Card>
  ),

  avatar: <Avatar name="Jeong Hoon" />,

  text: (
    <Text variant="title" weight="bold">Aa 가나다</Text>
  ),

  icon: <Icon name="star" size={32} />,
};
```

- [ ] **Step 3: 테스트 통과 확인**

Run: `pnpm --filter @superbase/docs test -- previews`
Expected: PASS (2 tests) — 17개 키 일치 + 17개 전부 예외 없이 렌더

만약 `@superbase/react` import가 해결되지 않으면 패키지 dist가 없는 것이다. `pnpm --filter @superbase/react build` 후 재시도한다(docs는 dist를 소비한다).

- [ ] **Step 4: 타입체크**

Run: `pnpm --filter @superbase/docs typecheck`
Expected: 에러 없음

`Stack`의 `gap`은 `SpacingScale`(0|1|2|3|4|6|8)이고 `Card`의 `padding`도 같다. 5나 7을 쓰면 여기서 타입 에러가 난다.

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/components/site/previews.tsx apps/docs/components/site/previews.module.css apps/docs/components/site/previews.test.tsx
git commit -m "feat(docs): 컴포넌트 미리보기 레지스트리 17개(실렌더 13 + 미니어처 4)"
```

---

## Task 4: 그리드 페이지에 연결

**Files:**
- Modify: `apps/docs/app/components/page.tsx`

- [ ] **Step 1: import 추가**

`apps/docs/app/components/page.tsx`의 기존 import 블록(3행 근처) 바로 뒤에 추가:

```tsx
import { PreviewFrame } from "../../components/site/PreviewFrame";
import { previews } from "../../components/site/previews";
```

- [ ] **Step 2: 플레이스홀더 교체**

현재 코드(59-62행):

```tsx
<a key={c.slug} href={`/components/${c.slug}`} style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
  <div style={{ height: 120, background: "var(--color-background-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand-primary)", fontWeight: 800, fontSize: "var(--font-size-title)" }}>
    {c.name}
  </div>
```

교체 후:

```tsx
<a key={c.slug} href={`/components/${c.slug}`} style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
  <PreviewFrame>{previews[c.slug]}</PreviewFrame>
```

카드의 나머지(뱃지·이름·blurb 블록)는 **그대로 둔다**.

- [ ] **Step 3: 타입체크 + 전체 docs 테스트**

Run: `pnpm --filter @superbase/docs typecheck && pnpm --filter @superbase/docs test`
Expected: 타입 에러 없음, 전체 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add apps/docs/app/components/page.tsx
git commit -m "feat(docs): 컴포넌트 목록 카드에 실제 미리보기 렌더"
```

---

## Task 5: 전체 검증 + 브라우저 시각·접근성 검수

**Files:** 없음 (검증 전용)

- [ ] **Step 1: 모노레포 전체 검증**

```bash
pnpm turbo run typecheck test build
```

Expected: 전부 PASS. `/components` 라우트가 정적 빌드된다.

빌드가 오래 걸리거나 멈추면 `apps/docs/.next`를 지우고 재시도한다(`rm -rf apps/docs/.next`) — route group 이동 후 stale 타입 캐시로 실패한 전례가 있다.

- [ ] **Step 2: 개발 서버 띄우고 시각 검수**

```bash
pnpm --filter @superbase/docs dev
```

`http://localhost:3000/components`에서 확인할 것:
1. 17개 카드 전부 텍스트가 아니라 **실제 컴포넌트/미니어처**가 보인다
2. 미니어처 4개(toast/modal/header/bottom-navigation)의 색·모서리·그림자가 어색하지 않다
3. 카드가 넘치거나 잘리지 않는다(특히 textfield 220px, tabs, card)
4. **다크 모드 토글** 후에도 17개 전부 정상 — 특히 미니어처의 배경·보더·scrim

- [ ] **Step 3: 접근성/인터랙션 검수 (이 작업의 핵심 위험)**

`/components`에서:
1. **카드 클릭** — 미리보기 위를 눌러도 카드 링크로 이동한다(Switch/Tab이 클릭을 삼키지 않는다)
2. **키보드 Tab 반복** — 포커스가 검색창 → 필터 pill들 → **카드 링크들만** 순서대로 이동한다. 미리보기 내부의 버튼(Tab/Checkbox/Switch/Button)에는 **절대 포커스가 들어가지 않아야 한다**. 들어간다면 `inert`가 안 걸린 것이다.

`inert`가 동작하지 않으면 브라우저 버전을 확인한다(Chrome 102+/Safari 15.5+/Firefox 112+). 그래도 안 되면 `PreviewFrame`에 `aria-hidden` + 내부 요소 `tabIndex={-1}` 강제 방안을 검토한다 — 다만 현대 브라우저에서는 `inert`로 충분하다.

- [ ] **Step 4: changeset 불필요 확인**

`apps/docs`는 private(미배포)다. 패키지 소스를 하나도 건드리지 않았으므로 **changeset을 만들지 않는다.**

- [ ] **Step 5: 최종 커밋 (검증에서 고친 게 있을 때만)**

```bash
git add -A
git commit -m "fix(docs): 미리보기 시각/접근성 검수 반영"
```

---

## 완료 후

`superpowers:finishing-a-development-branch`를 사용한다. 이 작업은 **기존 브랜치 `feature/green-rebrand-and-site-renewal`(PR #5)에 이어서 커밋**한다 — 교체 대상인 텍스트 플레이스홀더 자체가 이 PR에서 생긴 미머지 코드라, 별도 브랜치로 분리하면 미머지 코드에 의존하게 된다. 새 브랜치를 만들지 말 것.
