# BottomNavigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** floating stadium-pill `BottomNavigation` (compound, 기본형 + `onBack` 중첩형) + 5 nav icons, for web + RN + docs.

**Architecture:** compound `BottomNavigation`(context provider, nav/View pill) + `BottomNavigationItem`(icon render-fn + label, active=brand). `onBack` prop가 좌측 원형 뒤로 버튼+구분선을 토글. 아이콘은 `@superbase/icons`에 5종 추가해 양 패키지 `<Icon>`이 소비. 신규 토큰 없음.

**Tech Stack:** React 19, TypeScript, CSS Modules(웹), react-native(+RNW 테스트), Style Dictionary 토큰(소비만), vitest, changesets.

**Spec:** `docs/superpowers/specs/2026-06-23-bottom-navigation-design.md`

**전역 규약(기존 패턴):**
- 웹 CSS Module + 토큰 CSS 변수, RN `useTheme()`. RN 테스트는 ThemeProvider 없이 라이트 통과.
- compound는 Tabs 패턴(context, `useXContext` throw). root는 forwardRef.
- `describe/it/expect/vi` 글로벌. 신규 컴포넌트+테스트 **폴더 단위 커밋**. 컴포넌트 태스크는 test+typecheck 둘 다.
- **spacing 스케일 0/1/2/3/4/6/8 — 5·7 없음.**
- 각 패키지: `pnpm --filter @superbase/<pkg> test|typecheck|build`. 전체: `pnpm turbo run typecheck test build`.

**공유 시그니처(web/RN 동일):**
```
BottomNavigationProps { value: string; onChange?: (value: string) => void; onBack?: () => void; "aria-label"?: string; children }
BottomNavigationItemProps { value: string; icon: (active: boolean) => ReactNode; label: ReactNode; disabled?: boolean }
```

**파일 구조:**
- icons: `packages/icons/src/index.ts`(iconPaths +5) + `index.test.ts`.
- 웹: `packages/react/src/BottomNavigation/{BottomNavigationContext.ts, BottomNavigation.tsx, BottomNavigationItem.tsx, BottomNavigation.module.css, BottomNavigation.test.tsx}` + index.ts.
- RN: `packages/react-native/src/BottomNavigation/{BottomNavigationContext.ts, BottomNavigation.tsx, BottomNavigationItem.tsx, BottomNavigation.test.tsx}` + index.ts.
- 문서: `apps/docs/app/components/bottom-navigation/page.tsx` + `componentNav.ts` + `componentNav.test.ts`.

---

## Task 1: 아이콘 5종 추가 (@superbase/icons)

**Files:**
- Modify: `packages/icons/src/index.ts`
- Modify: `packages/icons/src/index.test.ts`

- [ ] **Step 1: 테스트 갱신(실패 예상)**

`packages/icons/src/index.test.ts`:
- `expect(iconNames).toHaveLength(18);` → `toHaveLength(23);`
- 그 `it` 또는 새 `it`에 추가:
```typescript
  it("includes the navigation icons", () => {
    for (const n of ["home", "calendar", "users", "chat", "arrow-left"] as const) {
      expect(iconNames).toContain(n);
    }
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/icons test`
Expected: FAIL — length 18 ≠ 23, names missing.

- [ ] **Step 3: 아이콘 패스 추가**

`packages/icons/src/index.ts`의 `iconPaths` 객체에서 `settings:` 줄 뒤(닫는 `} as const;` 앞)에 추가:
```ts
  home: "M4 11l8-7 8 7M6 9.5V20h12V9.5",
  calendar: "M4 6h16v14H4zM4 10h16M8 4v4M16 4v4",
  users: "M9 8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3.5 19a5.5 5.5 0 0 1 11 0M16.5 3a3 3 0 0 1 0 5.5M17 13.5a5.5 5.5 0 0 1 3.5 5.5",
  chat: "M4 5h16v11H9l-4 4v-4H4z",
  "arrow-left": "M19 12H5M11 6l-6 6 6 6",
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm --filter @superbase/icons test`
Expected: PASS.

- [ ] **Step 5: 빌드 + 시각검수(중요 — 아이콘은 시각이 진짜 게이트)**

Run: `pnpm --filter @superbase/icons build`
그다음 5개 아이콘을 PNG로 렌더해 모양 확인. 예) 임시 SVG 파일을 만들어 qlmanage로 렌더:
```bash
node -e '
const {iconPaths,ICON_VIEWBOX}=require("./packages/icons/dist/index.js");
const fs=require("fs");
for(const n of ["home","calendar","users","chat","arrow-left"]){
  fs.writeFileSync(`/tmp/icon-${n}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="${ICON_VIEWBOX}" fill="none" stroke="#191f28" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPaths[n]}"/></svg>`);
}
'
qlmanage -t -s 256 -o /tmp /tmp/icon-home.svg /tmp/icon-calendar.svg /tmp/icon-users.svg /tmp/icon-chat.svg /tmp/icon-arrow-left.svg 2>/dev/null
```
각 PNG(`/tmp/icon-*.svg.png`)를 Read로 열어 확인: home=집, calendar=달력(상단 탭2+구분선), users=사람 2명 그룹, chat=말풍선(꼬리), arrow-left=왼쪽 화살표. **모양이 어색하면 해당 패스를 수정**하고 재렌더해 양호해질 때까지 반복(테스트는 length만 보므로 시각이 최종 기준). 수정 시 src와 dist 모두 반영(`build` 재실행).

- [ ] **Step 6: 커밋**

```bash
git add packages/icons/src
git commit -m "feat(icons): add home/calendar/users/chat/arrow-left nav icons"
```

---

## Task 2: 웹 BottomNavigation (context + root + item + CSS)

**Files:**
- Create: `packages/react/src/BottomNavigation/BottomNavigationContext.ts`
- Create: `packages/react/src/BottomNavigation/BottomNavigation.tsx`
- Create: `packages/react/src/BottomNavigation/BottomNavigationItem.tsx`
- Create: `packages/react/src/BottomNavigation/BottomNavigation.module.css`
- Test: `packages/react/src/BottomNavigation/BottomNavigation.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react/src/BottomNavigation/BottomNavigation.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomNavigation } from "./BottomNavigation";
import { BottomNavigationItem } from "./BottomNavigationItem";

function items() {
  return (
    <>
      <BottomNavigationItem value="home" label="홈" icon={(a) => <span>{a ? "home-on" : "home-off"}</span>} />
      <BottomNavigationItem value="calendar" label="일정" icon={(a) => <span>{a ? "cal-on" : "cal-off"}</span>} />
      <BottomNavigationItem value="me" label="마이" disabled icon={(a) => <span>{a ? "me-on" : "me-off"}</span>} />
    </>
  );
}

describe("BottomNavigation", () => {
  it("marks the active item with aria-current=page", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByRole("button", { name: /홈/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /일정/ })).not.toHaveAttribute("aria-current");
  });

  it("passes active=true to the active item's icon only", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByText("home-on")).toBeInTheDocument();
    expect(screen.getByText("cal-off")).toBeInTheDocument();
  });

  it("calls onChange with the item value on click", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: /일정/ }));
    expect(onChange).toHaveBeenCalledWith("calendar");
  });

  it("does not call onChange for a disabled item", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: /마이/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders no back button by default", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.queryByRole("button", { name: "뒤로" })).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<BottomNavigation value="home" onChange={() => {}} onBack={onBack}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("exposes a nav landmark with aria-label", () => {
    render(<BottomNavigation value="home" onChange={() => {}} aria-label="주요 메뉴">{items()}</BottomNavigation>);
    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react test -- BottomNavigation`
Expected: FAIL — modules not found.

- [ ] **Step 3: Context 구현**

`packages/react/src/BottomNavigation/BottomNavigationContext.ts`:
```ts
import { createContext, useContext } from "react";

export interface BottomNavigationContextValue {
  value: string;
  onChange?: (value: string) => void;
}

export const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

export function useBottomNavigationContext(): BottomNavigationContextValue {
  const ctx = useContext(BottomNavigationContext);
  if (!ctx) throw new Error("BottomNavigationItem must be used within <BottomNavigation>");
  return ctx;
}
```

- [ ] **Step 4: BottomNavigation root 구현**

`packages/react/src/BottomNavigation/BottomNavigation.tsx`:
```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { BottomNavigationContext } from "./BottomNavigationContext";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  children: ReactNode;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, children, className, "aria-label": ariaLabel = "Bottom navigation", ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label={ariaLabel} className={[styles.bar, className].filter(Boolean).join(" ")} {...rest}>
      {onBack && (
        <>
          <button type="button" className={styles.back} aria-label="뒤로" onClick={onBack}>
            <Icon name="arrow-left" size="sm" />
          </button>
          <span className={styles.divider} aria-hidden="true" />
        </>
      )}
      <BottomNavigationContext.Provider value={{ value, onChange }}>
        {children}
      </BottomNavigationContext.Provider>
    </nav>
  );
});
```

- [ ] **Step 5: BottomNavigationItem 구현**

`packages/react/src/BottomNavigation/BottomNavigationItem.tsx`:
```tsx
import type { ReactNode } from "react";
import { useBottomNavigationContext } from "./BottomNavigationContext";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationItemProps {
  value: string;
  icon: (active: boolean) => ReactNode;
  label: ReactNode;
  disabled?: boolean;
}

export function BottomNavigationItem({ value, icon, label, disabled = false }: BottomNavigationItemProps) {
  const { value: active, onChange } = useBottomNavigationContext();
  const selected = active === value;
  return (
    <button
      type="button"
      className={styles.item}
      data-active={selected ? "true" : undefined}
      aria-current={selected ? "page" : undefined}
      disabled={disabled}
      onClick={() => onChange?.(value)}
    >
      <span className={styles.icon}>{icon(selected)}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
```

- [ ] **Step 6: CSS 작성**

`packages/react/src/BottomNavigation/BottomNavigation.module.css`:
```css
.bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background-default);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
}
.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-1);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
}
.item:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }
.item[data-active="true"] { color: var(--color-brand-primary); }
.item:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: calc(-1 * var(--focus-ring-offset));
}
.icon { display: inline-flex; }
.label {
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-caption);
}
.back {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size-field-sm);
  height: var(--size-field-sm);
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-background-subtle);
  color: var(--color-text-primary);
  cursor: pointer;
}
.back:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
.divider {
  flex-shrink: 0;
  width: var(--border-width-thin);
  align-self: stretch;
  margin: var(--spacing-2) var(--spacing-1);
  background: var(--color-border-default);
}
```

- [ ] **Step 7: 통과 확인**

Run: `pnpm --filter @superbase/react test -- BottomNavigation`
Expected: PASS (7 tests). 그리고 `pnpm --filter @superbase/react test`로 무회귀 확인.

> 참고: 웹 아이콘은 `color="currentColor"` 기본이라 `.item[data-active]`의 brand 색을 자동 상속한다(consumer가 render 함수에서 명시 색을 줄 수도 있음). 라벨 색은 CSS가 담당.

- [ ] **Step 8: 커밋**

```bash
git add packages/react/src/BottomNavigation
git commit -m "feat(react): add BottomNavigation (compound + onBack nested)"
```

---

## Task 3: 웹 index.ts export

**Files:**
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react/src/index.ts` 끝에 추가:
```ts
export { BottomNavigation } from "./BottomNavigation/BottomNavigation";
export type { BottomNavigationProps } from "./BottomNavigation/BottomNavigation";
export { BottomNavigationItem } from "./BottomNavigation/BottomNavigationItem";
export type { BottomNavigationItemProps } from "./BottomNavigation/BottomNavigationItem";
```

- [ ] **Step 2: 빌드 + 타입체크**

Run: `pnpm --filter @superbase/react typecheck && pnpm --filter @superbase/react build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add packages/react/src/index.ts
git commit -m "feat(react): export BottomNavigation"
```

---

## Task 4: RN BottomNavigation (context + root + item)

**Files:**
- Create: `packages/react-native/src/BottomNavigation/BottomNavigationContext.ts`
- Create: `packages/react-native/src/BottomNavigation/BottomNavigation.tsx`
- Create: `packages/react-native/src/BottomNavigation/BottomNavigationItem.tsx`
- Test: `packages/react-native/src/BottomNavigation/BottomNavigation.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

`packages/react-native/src/BottomNavigation/BottomNavigation.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Text } from "react-native";
import { BottomNavigation } from "./BottomNavigation";
import { BottomNavigationItem } from "./BottomNavigationItem";

function items() {
  return (
    <>
      <BottomNavigationItem value="home" label="홈" icon={(a) => <Text>{a ? "home-on" : "home-off"}</Text>} />
      <BottomNavigationItem value="calendar" label="일정" icon={(a) => <Text>{a ? "cal-on" : "cal-off"}</Text>} />
      <BottomNavigationItem value="me" label="마이" disabled icon={(a) => <Text>{a ? "me-on" : "me-off"}</Text>} />
    </>
  );
}

describe("BottomNavigation (RN)", () => {
  it("passes active=true to the active item's icon only", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.getByText("home-on")).toBeInTheDocument();
    expect(screen.getByText("cal-off")).toBeInTheDocument();
  });

  it("calls onChange with the value on press", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByText("일정"));
    expect(onChange).toHaveBeenCalledWith("calendar");
  });

  it("does not call onChange for a disabled item", () => {
    const onChange = vi.fn();
    render(<BottomNavigation value="home" onChange={onChange}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByText("마이"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders no back button by default", () => {
    render(<BottomNavigation value="home" onChange={() => {}}>{items()}</BottomNavigation>);
    expect(screen.queryByLabelText("뒤로")).toBeNull();
  });

  it("renders a back button when onBack is given and calls it", () => {
    const onBack = vi.fn();
    render(<BottomNavigation value="home" onChange={() => {}} onBack={onBack}>{items()}</BottomNavigation>);
    fireEvent.click(screen.getByLabelText("뒤로"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
```
> 주: 라벨/아이콘 텍스트로 검증(RNW role/state 매핑 의존 회피). `getByLabelText("뒤로")`가 안 되면 `getByRole("button", { name: "뒤로" })`로 테스트 쿼리만 조정.

- [ ] **Step 2: 실패 확인**

Run: `pnpm --filter @superbase/react-native test -- BottomNavigation`
Expected: FAIL — modules not found.

- [ ] **Step 3: Context 구현**

`packages/react-native/src/BottomNavigation/BottomNavigationContext.ts`:
```ts
import { createContext, useContext } from "react";

export interface BottomNavigationContextValue {
  value: string;
  onChange?: (value: string) => void;
}

export const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

export function useBottomNavigationContext(): BottomNavigationContextValue {
  const ctx = useContext(BottomNavigationContext);
  if (!ctx) throw new Error("BottomNavigationItem must be used within <BottomNavigation>");
  return ctx;
}
```

- [ ] **Step 4: BottomNavigation root 구현**

`packages/react-native/src/BottomNavigation/BottomNavigation.tsx`:
```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Pressable } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { BottomNavigationContext } from "./BottomNavigationContext";

export interface BottomNavigationProps {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  children: ReactNode;
  "aria-label"?: string;
}

export const BottomNavigation = forwardRef<ElementRef<typeof View>, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, children, "aria-label": ariaLabel = "Bottom navigation" },
  ref,
) {
  const t = useTheme();
  return (
    <View
      ref={ref}
      accessibilityLabel={ariaLabel}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing["1"],
        paddingHorizontal: t.spacing["3"],
        paddingVertical: t.spacing["2"],
        backgroundColor: t.color.background.default,
        borderRadius: t.radius.full,
        ...t.shadow.lg,
      }}
    >
      {onBack ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={onBack}
            style={{
              width: t.size.fieldSm,
              height: t.size.fieldSm,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              backgroundColor: t.color.background.subtle,
            }}
          >
            <Icon name="arrow-left" size="sm" color={t.color.text.primary} />
          </Pressable>
          <View
            style={{
              width: t.borderWidth.thin,
              alignSelf: "stretch",
              marginHorizontal: t.spacing["1"],
              marginVertical: t.spacing["2"],
              backgroundColor: t.color.border.default,
            }}
          />
        </>
      ) : null}
      <BottomNavigationContext.Provider value={{ value, onChange }}>
        {children}
      </BottomNavigationContext.Provider>
    </View>
  );
});
```

- [ ] **Step 5: BottomNavigationItem 구현**

`packages/react-native/src/BottomNavigation/BottomNavigationItem.tsx`:
```tsx
import type { ReactNode } from "react";
import { Pressable, Text as RNText, View, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useBottomNavigationContext } from "./BottomNavigationContext";

export interface BottomNavigationItemProps {
  value: string;
  icon: (active: boolean) => ReactNode;
  label: ReactNode;
  disabled?: boolean;
}

export function BottomNavigationItem({ value, icon, label, disabled = false }: BottomNavigationItemProps) {
  const t = useTheme();
  const { value: active, onChange } = useBottomNavigationContext();
  const selected = active === value;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(value)}
      style={{
        flex: 1,
        alignItems: "center",
        gap: t.spacing["1"],
        paddingVertical: t.spacing["2"],
        paddingHorizontal: t.spacing["1"],
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View>{icon(selected)}</View>
      <RNText
        style={{
          fontSize: t.font.size.caption,
          fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          color: selected ? t.color.brand.primary : t.color.text.secondary,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
}
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm --filter @superbase/react-native test -- BottomNavigation`
Expected: PASS (5 tests). 그리고 `pnpm --filter @superbase/react-native test` 무회귀.

- [ ] **Step 7: 커밋**

```bash
git add packages/react-native/src/BottomNavigation
git commit -m "feat(react-native): add BottomNavigation (compound + onBack nested)"
```

---

## Task 5: RN index.ts export

**Files:**
- Modify: `packages/react-native/src/index.ts`

- [ ] **Step 1: export 추가**

`packages/react-native/src/index.ts` 끝에 추가:
```ts
export { BottomNavigation } from "./BottomNavigation/BottomNavigation";
export type { BottomNavigationProps } from "./BottomNavigation/BottomNavigation";
export { BottomNavigationItem } from "./BottomNavigation/BottomNavigationItem";
export type { BottomNavigationItemProps } from "./BottomNavigation/BottomNavigationItem";
```

- [ ] **Step 2: 빌드 + 타입체크**

Run: `pnpm --filter @superbase/react-native typecheck && pnpm --filter @superbase/react-native build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add packages/react-native/src/index.ts
git commit -m "feat(react-native): export BottomNavigation"
```

---

## Task 6: 문서 — BottomNavigation 페이지 + nav

**Files:**
- Modify: `apps/docs/components/docs/componentNav.ts`
- Modify: `apps/docs/components/docs/componentNav.test.ts`
- Create: `apps/docs/app/components/bottom-navigation/page.tsx`

- [ ] **Step 0: 기존 패턴 확인**

READ `apps/docs/app/components/toast/page.tsx`(상태있는 데모 + ComponentDoc/Tabs/Example/Code/ClientOnly) + `componentNav.ts`/`.test.ts`. RN Button=`onPress`/web=`onClick` 확인. `useTheme`는 `@superbase/react-native`에서 export됨(RN 데모에서 활성색에 사용).

- [ ] **Step 1: nav.test 갱신**

`apps/docs/components/docs/componentNav.test.ts`:
- `expect(componentNav).toHaveLength(15);` → `toHaveLength(16);`
- 추가: `expect(componentNav.map((c) => c.slug)).toContain("bottom-navigation");`

- [ ] **Step 2: nav 항목 추가**

`apps/docs/components/docs/componentNav.ts`의 `componentNav` 배열에서 `badge`와 `button` 사이에 추가:
```ts
  { slug: "bottom-navigation", label: "BottomNavigation" },
```

- [ ] **Step 3: 페이지 작성**

`apps/docs/app/components/bottom-navigation/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import {
  BottomNavigation as WebBottomNavigation,
  BottomNavigationItem as WebBottomNavigationItem,
  Icon as WebIcon,
} from "@superbase/react";
import {
  BottomNavigation as RNBottomNavigation,
  BottomNavigationItem as RNBottomNavigationItem,
  Icon as RNIcon,
  useTheme as useRNTheme,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const frame: React.CSSProperties = {
  background: "var(--color-background-subtle)",
  padding: "var(--spacing-6) var(--spacing-4)",
  borderRadius: "var(--radius-lg)",
};

function WebDemo({ withBack }: { withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const wi = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <WebIcon name={name} color={active ? "var(--color-brand-primary)" : "var(--color-text-secondary)"} />
  );
  return (
    <div style={frame}>
      <WebBottomNavigation value={value} onChange={setValue} onBack={withBack ? () => {} : undefined}>
        <WebBottomNavigationItem value="home" label="홈" icon={wi("home")} />
        <WebBottomNavigationItem value="calendar" label="일정" icon={wi("calendar")} />
        <WebBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={wi("users")} />
        <WebBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={wi(withBack ? "chat" : "user")} />
      </WebBottomNavigation>
    </div>
  );
}

function RNDemo({ withBack }: { withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const t = useRNTheme();
  const ri = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <RNIcon name={name} color={active ? t.color.brand.primary : t.color.text.secondary} />
  );
  return (
    <div style={frame}>
      <RNBottomNavigation value={value} onChange={setValue} onBack={withBack ? () => {} : undefined}>
        <RNBottomNavigationItem value="home" label="홈" icon={ri("home")} />
        <RNBottomNavigationItem value="calendar" label="일정" icon={ri("calendar")} />
        <RNBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={ri("users")} />
        <RNBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={ri(withBack ? "chat" : "user")} />
      </RNBottomNavigation>
    </div>
  );
}

const webContent = (
  <>
    <Example
      title="기본"
      description={<><Code>value</Code>/<Code>onChange</Code>로 제어합니다. <Code>icon</Code>은 <Code>(active) =&gt; ReactNode</Code> 렌더 함수입니다. 활성 항목은 브랜드 색으로 강조됩니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? brand : secondary} />} />
  …
</BottomNavigation>`}
    >
      <WebDemo />
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>을 주면 좌측에 뒤로가기 버튼이 생깁니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <WebDemo withBack />
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본"
      description={<>RN도 동일 API. <Code>icon</Code>의 색은 <Code>useTheme()</Code>로 가져옵니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? t.color.brand.primary : t.color.text.secondary} />} />
  …
</BottomNavigation>`}
    >
      <ClientOnly><RNDemo /></ClientOnly>
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>으로 뒤로가기 버튼을 표시합니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <ClientOnly><RNDemo withBack /></ClientOnly>
    </Example>
  </>
);

export default function BottomNavigationPage() {
  return (
    <ComponentDoc title="BottomNavigation" lead="화면 하단의 floating 네비게이션 바. 기본형과 뒤로가기 중첩형을 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```
> Step 0에서 본 toast/card 페이지의 import 경로/`Tabs`·`Example` props와 정확히 일치시킬 것. `useTheme`가 `@superbase/react-native`에서 export되는지 확인(안 되면 RN 활성색을 하드코딩 hex로: brand=#3182f6).

- [ ] **Step 4: 빌드 확인**

먼저 dist 최신화: `pnpm --filter @superbase/icons build && pnpm --filter @superbase/react build && pnpm --filter @superbase/react-native build`
그다음: `pnpm --filter @superbase/docs build && pnpm --filter @superbase/docs test`
Expected: 성공 — `/components/bottom-navigation` 정적 빌드, componentNav 테스트(16) 통과.

- [ ] **Step 5: 커밋**

```bash
git add apps/docs/components/docs/componentNav.ts apps/docs/components/docs/componentNav.test.ts apps/docs/app/components/bottom-navigation/page.tsx
git commit -m "docs: add BottomNavigation page + nav entry"
```

---

## Task 7: changeset + 전체 검증

**Files:**
- Create: `.changeset/bottom-navigation.md`

- [ ] **Step 1: changeset 작성**

`.changeset/bottom-navigation.md`:
```markdown
---
"@superbase/icons": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

Add BottomNavigation (compound: BottomNavigation + BottomNavigationItem) with a floating stadium-pill bar, brand-highlighted active item, and an optional back button (onBack) for nested screens, for web and React Native. Adds home/calendar/users/chat/arrow-left icons.
```

- [ ] **Step 2: 전체 검증**

Run: `pnpm turbo run typecheck test build --force`
Expected: 전 패키지 PASS. 테스트 증가(icons +1, react +7, react-native +5). docs 빌드에 `/components/bottom-navigation` 포함.

- [ ] **Step 3: 헤드리스 시각검수**

docs를 `next start`로 띄우고 헤드리스 Chrome(CDP)로 `/components/bottom-navigation` 접속 → 기본형/중첩형 캡처: floating stadium pill, 활성 항목 파랑(아이콘+라벨), 비활성 회색, 중첩형 좌측 원형 뒤로 버튼+구분선, 아이템 클릭 시 활성 이동. RN 탭도 동일. 아이콘(집/달력/사람들/말풍선/화살표) 모양도 함께 확인.

- [ ] **Step 4: 커밋**

```bash
git add .changeset/bottom-navigation.md
git commit -m "chore: changeset for BottomNavigation"
```

---

## Self-Review 메모(작성자 검증)

- **Spec 커버리지**: 아이콘 5종=T1 / 웹(context+root+item+CSS=T2, export=T3) / RN(T4·T5) / 문서+nav=T6 / changeset+검증=T7. onBack 기본/중첩 분기 T2·T4. icon 렌더함수 active T2·T4 테스트. a11y(web nav+aria-current / RN accessibilityState) 반영. 신규 토큰 없음(확인). 누락 없음. (배지·고정위치·5개초과는 spec 유예 → 제외 정상.)
- **타입 일관성**: `BottomNavigationProps`(value/onChange/onBack/aria-label/children)·`BottomNavigationItemProps`(value/icon:(active)=>ReactNode/label/disabled) web/RN 동일. context `{value,onChange}`+`useBottomNavigationContext` throw 동일. root forwardRef(web HTMLElement=nav / RN ElementRef<View>). 토큰: `--radius-full`/`t.radius.full`, `--size-field-sm`/`t.size.fieldSm`, `--border-width-thin`/`t.borderWidth.thin`, `--opacity-disabled`/`t.opacity.disabled`, brand/secondary/border/subtle 색, caption 폰트 — 모두 기존 존재. spacing 1/2/3만 사용(5·7 없음).
- **플레이스홀더**: 없음(모든 step 코드/명령/기대값). 아이콘 패스는 시각검수로 다듬는 단계 명시(T1 Step5).
- **검증 가정(구현 중 확인)**: ① 아이콘 패스 모양 — qlmanage 시각검수 후 필요시 수정(T1). ② RNW `getByLabelText("뒤로")` 안 되면 `getByRole` 조정(T4). ③ docs `useTheme` export 확인(안 되면 hex 하드코딩)(T6). ④ web Icon currentColor가 `.item[data-active]` brand 상속(보조 — 데모는 명시 색 전달).
