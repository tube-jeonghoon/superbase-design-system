# Plan 3a-1 — Card + Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@superbase/react`·`@superbase/react-native`에 Card(elevation/bordered/padding)와 Avatar(이미지 + 이니셜/아이콘 폴백, size/shape) 컴포넌트를 추가한다. 신규 `size-avatar-*` 토큰을 더하고 문서 페이지를 만든다.

**Architecture:** Card는 토큰 기반 컨테이너(shadow/radius/border/padding). Avatar는 src 로드 실패 시 name 이니셜 → user 아이콘으로 폴백(로컬 state). 둘 다 forwardRef. 웹=CSS Module+토큰 변수, RN=`useTheme()`. 전부 신규 추가(non-breaking).

**Tech Stack:** React 19, Vite(웹), tsc(RN), Style Dictionary(토큰), CSS Modules + 토큰, Vitest + jsdom + Testing Library, Next.js(docs). 변경: `@superbase/tokens`, `@superbase/react`, `@superbase/react-native`, `apps/docs`.

> 전제: Phase 1·2 완료. shadow 토큰 `t.shadow.{sm,md,lg,xl}`(RN 객체)·`--shadow-{sm,md,lg}`(웹). Icon `name="user"`는 유효한 IconName. docs 페이지 패턴: `"use client"` + `<Web…>`/`<RN…>` import + `ComponentDoc`/`Tabs`/`Example`/`Code`/`ClientOnly`, `componentNav`(slug/label 배열, 알파벳순). 토큰 테스트는 temp dir(`dist` 변수)로 빌드. docs는 dist의 .d.ts 소비 → 컴포넌트 변경 후 패키지 빌드 필요.
> 명령: `pnpm --filter @superbase/tokens test`, `pnpm --filter @superbase/react test <path>`, `pnpm --filter @superbase/react-native test <path>`, 각 `typecheck`.

---

## Task 1: 토큰 — size-avatar-{sm,md,lg}

**Files:** Modify `packages/tokens/src/sizing.json`, `packages/tokens/build.mjs`(themeDts), `packages/tokens/test/build.test.ts`, `packages/tokens/test/theme.test.ts`.

- [ ] **Step 1: 실패 테스트 추가**

`build.test.ts`의 snapshot 케이스 앞에(파일이 쓰는 temp `dist` 변수 사용):
```ts
  it("emits avatar size tokens (web + native)", () => {
    const css = readFileSync(join(dist, "web/variables.css"), "utf8");
    expect(css).toContain("--size-avatar-sm: 32px;");
    expect(css).toContain("--size-avatar-md: 40px;");
    expect(css).toContain("--size-avatar-lg: 56px;");
    const js = readFileSync(join(dist, "native/tokens.js"), "utf8");
    expect(js).toContain("export const SizeAvatarMd = 40;");
  });
```
`theme.test.ts`에서 `expect(lightTheme.size.switchSm.thumb).toBe(20);` 줄 뒤에:
```ts
    expect(lightTheme.size.avatar.md).toBe(40);
    expect(lightTheme.size.avatar.lg).toBe(56);
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @superbase/tokens test`.

- [ ] **Step 3: sizing.json에 avatar 추가**

`packages/tokens/src/sizing.json`의 `"icon": { ... }` 블록 **뒤**(닫는 `}` 앞)에 콤마 추가 후:
```json
    "avatar": {
      "sm": { "value": "32px" },
      "md": { "value": "40px" },
      "lg": { "value": "56px" }
    }
```
(즉 `icon` 블록 끝 `}` 뒤에 `,` 붙이고 위 `avatar` 블록을 추가.)

- [ ] **Step 4: build.mjs themeDts에 타입 추가**

`themeDts()`의 `size:` 인터페이스 `icon: { xs: number; sm: number; md: number; lg: number };` 줄 **뒤**에 추가:
```js
    avatar: { sm: number; md: number; lg: number };
```

- [ ] **Step 5: 통과 + 실제 dist 재빌드**

`pnpm --filter @superbase/tokens test` → PASS(스냅샷 변경 시 패키지 내 `pnpm exec vitest run -u`). 그다음 `pnpm --filter @superbase/tokens build`로 실제 dist 갱신(확인: `--size-avatar-md: 40px;`, theme.d.ts에 `avatar`).

- [ ] **Step 6: 커밋**
```bash
git add packages/tokens/src/sizing.json packages/tokens/build.mjs packages/tokens/test/build.test.ts packages/tokens/test/theme.test.ts packages/tokens/test/__snapshots__
git commit -m "feat(tokens): add avatar size tokens (32/40/56)"
```

---

## Task 2: Card (web + RN)

**Files:** Create `packages/react/src/Card/Card.tsx` + `Card.module.css` + `Card.test.tsx`; `packages/react-native/src/Card/Card.tsx` + `Card.test.tsx`. Modify both `index.ts`.

- [ ] **Step 1: 웹 실패 테스트**

Create `packages/react/src/Card/Card.test.tsx`:
```tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children with default elevation=sm", () => {
    const { container } = render(<Card>Body</Card>);
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(container.querySelector('[data-elevation="sm"]')).not.toBeNull();
  });

  it("supports bordered and elevation props", () => {
    const { container } = render(<Card elevation="lg" bordered>X</Card>);
    expect(container.querySelector('[data-elevation="lg"]')).not.toBeNull();
    expect(container.querySelector('[data-bordered="true"]')).not.toBeNull();
  });

  it("forwards ref to the div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>X</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @superbase/react test src/Card/Card.test.tsx`.

- [ ] **Step 3: 웹 Card 생성**

`packages/react/src/Card/Card.tsx`:
```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Card.module.css";

export type CardElevation = "none" | "sm" | "md" | "lg";
export type CardPadding = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: CardElevation;
  bordered?: boolean;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, elevation = "sm", bordered = false, padding = 4, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-elevation={elevation}
      data-bordered={bordered ? "true" : undefined}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ padding: padding === 0 ? 0 : `var(--spacing-${padding})`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});
```
`packages/react/src/Card/Card.module.css`:
```css
.card {
  background: var(--color-background-default);
  border-radius: var(--radius-lg);
}
.card[data-elevation="sm"] { box-shadow: var(--shadow-sm); }
.card[data-elevation="md"] { box-shadow: var(--shadow-md); }
.card[data-elevation="lg"] { box-shadow: var(--shadow-lg); }
.card[data-bordered="true"] { border: var(--border-width-thin) solid var(--color-border-default); }
```

- [ ] **Step 4: 웹 통과** — test PASS + `pnpm --filter @superbase/react typecheck` 0.

- [ ] **Step 5: RN 실패 테스트**

Create `packages/react-native/src/Card/Card.test.tsx`:
```tsx
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card (RN)", () => {
  it("renders children", () => {
    render(<Card><span>Body</span></Card>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<unknown>();
    render(<Card ref={ref as never}><span>x</span></Card>);
    expect(ref.current).not.toBeNull();
  });
});
```

- [ ] **Step 6: RN 실패 확인** — `pnpm --filter @superbase/react-native test src/Card/Card.test.tsx`.

- [ ] **Step 7: RN Card 생성**

`packages/react-native/src/Card/Card.tsx`:
```tsx
import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type CardElevation = "none" | "sm" | "md" | "lg";
export type CardPadding = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface CardProps extends ViewProps {
  children: ReactNode;
  elevation?: CardElevation;
  bordered?: boolean;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
}

export const Card = forwardRef<ElementRef<typeof View>, CardProps>(function Card(
  { children, elevation = "sm", bordered = false, padding = 4, style, ...rest },
  ref,
) {
  const t = useTheme();
  const pad: Record<CardPadding, number> = {
    0: 0,
    1: t.spacing["1"],
    2: t.spacing["2"],
    3: t.spacing["3"],
    4: t.spacing["4"],
    6: t.spacing["6"],
    8: t.spacing["8"],
  };
  return (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: t.color.background.default,
          borderRadius: t.radius.lg,
          padding: pad[padding],
          ...(elevation !== "none" ? t.shadow[elevation] : null),
          ...(bordered ? { borderWidth: t.borderWidth.thin, borderColor: t.color.border.default } : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
});
```

- [ ] **Step 8: RN 통과** — test PASS + `pnpm --filter @superbase/react-native typecheck` 0.

- [ ] **Step 9: index.ts에 export 추가**

`packages/react/src/index.ts` 끝에:
```ts
export { Card } from "./Card/Card";
export type { CardProps, CardElevation, CardPadding } from "./Card/Card";
```
`packages/react-native/src/index.ts`에 동일 2줄(맨 끝 theme export 앞 또는 뒤 — 위치 무관).

- [ ] **Step 10: 커밋**
```bash
git add packages/react/src/Card packages/react/src/index.ts packages/react-native/src/Card packages/react-native/src/index.ts
git commit -m "feat: Card component (web + RN)"
```

---

## Task 3: Avatar (web + RN)

**Files:** Create `packages/react/src/Avatar/Avatar.tsx` + `Avatar.module.css` + `Avatar.test.tsx`; `packages/react-native/src/Avatar/Avatar.tsx` + `Avatar.test.tsx`. Modify both `index.ts`.

- [ ] **Step 1: 웹 실패 테스트**

Create `packages/react/src/Avatar/Avatar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("shows initials from name when no src", () => {
    render(<Avatar name="Jeong Hoon" />);
    expect(screen.getByText("JH")).toBeInTheDocument();
  });

  it("renders an image when src is given", () => {
    const { container } = render(<Avatar src="/a.png" name="A" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/a.png");
  });

  it("falls back to a user icon with no src and no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인** — `pnpm --filter @superbase/react test src/Avatar/Avatar.test.tsx`.

- [ ] **Step 3: 웹 Avatar 생성**

`packages/react/src/Avatar/Avatar.tsx`:
```tsx
import { forwardRef, useState, type HTMLAttributes } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
}

function initials(name?: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = "md", shape = "circle", className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;
  const text = initials(name);
  const labelProps = showImage ? {} : ({ role: "img", "aria-label": name || undefined } as const);
  return (
    <span
      ref={ref}
      data-size={size}
      data-shape={shape}
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      {...labelProps}
      {...rest}
    >
      {showImage ? (
        <img className={styles.img} src={src} alt={name ?? ""} onError={() => setFailed(true)} />
      ) : text ? (
        <span className={styles.initials} aria-hidden="true">{text}</span>
      ) : (
        <Icon name="user" size={16} />
      )}
    </span>
  );
});
```
`packages/react/src/Avatar/Avatar.module.css`:
```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-background-subtle);
  color: var(--color-text-secondary);
}
.avatar[data-size="sm"] { width: var(--size-avatar-sm); height: var(--size-avatar-sm); font-size: var(--font-size-caption); }
.avatar[data-size="md"] { width: var(--size-avatar-md); height: var(--size-avatar-md); font-size: var(--font-size-body); }
.avatar[data-size="lg"] { width: var(--size-avatar-lg); height: var(--size-avatar-lg); font-size: var(--font-size-title); }
.avatar[data-shape="circle"] { border-radius: var(--radius-full); }
.avatar[data-shape="square"] { border-radius: var(--radius-md); }
.img { width: 100%; height: 100%; object-fit: cover; }
.initials { font-weight: var(--font-weight-medium); }
```

- [ ] **Step 4: 웹 통과** — test PASS + typecheck 0.

- [ ] **Step 5: RN 실패 테스트**

Create `packages/react-native/src/Avatar/Avatar.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar (RN)", () => {
  it("shows initials from name when no src", () => {
    render(<Avatar name="Jeong Hoon" />);
    expect(screen.getByText("JH")).toBeInTheDocument();
  });

  it("falls back to a user icon with no src and no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
```

- [ ] **Step 6: RN 실패 확인** — `pnpm --filter @superbase/react-native test src/Avatar/Avatar.test.tsx`.

- [ ] **Step 7: RN Avatar 생성**

`packages/react-native/src/Avatar/Avatar.tsx`:
```tsx
import { forwardRef, useState, type ElementRef } from "react";
import { View, Image, Text as RNText, type StyleProp, type ViewStyle, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Icon } from "../Icon/Icon";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  style?: StyleProp<ViewStyle>;
}

function initials(name?: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const Avatar = forwardRef<ElementRef<typeof View>, AvatarProps>(function Avatar(
  { src, name, size = "md", shape = "circle", style },
  ref,
) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  const dim = t.size.avatar[size];
  const radius = shape === "circle" ? t.radius.full : t.radius.md;
  const showImage = !!src && !failed;
  const text = initials(name);
  const fontFor: Record<AvatarSize, number> = {
    sm: t.font.size.caption,
    md: t.font.size.body,
    lg: t.font.size.title,
  };
  return (
    <View
      ref={ref}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.color.background.subtle,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image source={{ uri: src }} onError={() => setFailed(true)} style={{ width: "100%", height: "100%" }} />
      ) : text ? (
        <RNText
          style={{
            color: t.color.text.secondary,
            fontSize: fontFor[size],
            fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          }}
        >
          {text}
        </RNText>
      ) : (
        <Icon name="user" size={16} color={t.color.text.secondary} />
      )}
    </View>
  );
});
```

- [ ] **Step 8: RN 통과** — test PASS + typecheck 0.

- [ ] **Step 9: index.ts export**

양쪽 `index.ts`에 추가:
```ts
export { Avatar } from "./Avatar/Avatar";
export type { AvatarProps, AvatarSize, AvatarShape } from "./Avatar/Avatar";
```

- [ ] **Step 10: 커밋**
```bash
git add packages/react/src/Avatar packages/react/src/index.ts packages/react-native/src/Avatar packages/react-native/src/index.ts
git commit -m "feat: Avatar component with initials/icon fallback (web + RN)"
```

---

## Task 4: docs — Card · Avatar 페이지 + 사이드바

**Files:** Modify `apps/docs/components/docs/componentNav.ts`; Create `apps/docs/app/components/card/page.tsx`, `apps/docs/app/components/avatar/page.tsx`.

- [ ] **Step 1: 컴포넌트 패키지 빌드(타입 최신화)**
Run: `pnpm turbo run build --filter=@superbase/react --filter=@superbase/react-native`

- [ ] **Step 2: 사이드바 항목 추가**

`apps/docs/components/docs/componentNav.ts`의 `componentNav` 배열에 알파벳 위치로 추가: `{ slug: "avatar", label: "Avatar" }`(맨 앞, badge 앞), `{ slug: "card", label: "Card" }`(button 뒤, checkbox 앞). 최종 배열:
```ts
export const componentNav: ComponentNavItem[] = [
  { slug: "avatar", label: "Avatar" },
  { slug: "badge", label: "Badge" },
  { slug: "button", label: "Button" },
  { slug: "card", label: "Card" },
  { slug: "checkbox", label: "Checkbox" },
  { slug: "icon", label: "Icon" },
  { slug: "radio", label: "Radio" },
  { slug: "spinner", label: "Spinner" },
  { slug: "stack", label: "Stack" },
  { slug: "switch", label: "Switch" },
  { slug: "text", label: "Text" },
  { slug: "textfield", label: "TextField" },
];
```

- [ ] **Step 3: Card 페이지 생성**

Create `apps/docs/app/components/card/page.tsx`:
```tsx
"use client";
import { Card as WebCard, Text as WebText } from "@superbase/react";
import { Card as RNCard, Text as RNText } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-4)", flexWrap: "wrap" };

const webContent = (
  <>
    <Example
      title="elevation"
      description={<><Code>elevation</Code>(none/sm/md/lg)으로 그림자 깊이를 정합니다.</>}
      code={`<Card elevation="sm">…</Card>\n<Card elevation="md">…</Card>\n<Card elevation="lg">…</Card>`}
    >
      <div style={row}>
        <WebCard elevation="sm"><WebText weight="medium">sm</WebText></WebCard>
        <WebCard elevation="md"><WebText weight="medium">md</WebText></WebCard>
        <WebCard elevation="lg"><WebText weight="medium">lg</WebText></WebCard>
      </div>
    </Example>
    <Example
      title="bordered · padding"
      description={<><Code>bordered</Code>로 보더, <Code>padding</Code>으로 안쪽 여백을 정합니다.</>}
      code={`<Card bordered elevation="none" padding={6}>…</Card>`}
    >
      <WebCard bordered elevation="none" padding={6}>
        <WebText weight="bold">제목</WebText>
        <WebText color="secondary">보더 + 큰 패딩 카드</WebText>
      </WebCard>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="elevation"
      description={<><Code>elevation</Code>(none/sm/md/lg)으로 그림자 깊이를 정합니다.</>}
      code={`<Card elevation="md">…</Card>`}
    >
      <ClientOnly>
        <div style={row}>
          <RNCard elevation="sm"><RNText weight="medium">sm</RNText></RNCard>
          <RNCard elevation="md"><RNText weight="medium">md</RNText></RNCard>
          <RNCard elevation="lg"><RNText weight="medium">lg</RNText></RNCard>
        </div>
      </ClientOnly>
    </Example>
    <Example
      title="bordered · padding"
      description={<><Code>bordered</Code>로 보더, <Code>padding</Code>으로 안쪽 여백을 정합니다.</>}
      code={`<Card bordered elevation="none" padding={6}>…</Card>`}
    >
      <ClientOnly>
        <RNCard bordered elevation="none" padding={6}>
          <RNText weight="bold">제목</RNText>
          <RNText color="secondary">보더 + 큰 패딩 카드</RNText>
        </RNCard>
      </ClientOnly>
    </Example>
  </>
);

export default function CardPage() {
  return (
    <ComponentDoc title="Card" lead="콘텐츠를 담는 컨테이너. 그림자·보더·패딩을 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 4: Avatar 페이지 생성**

Create `apps/docs/app/components/avatar/page.tsx`:
```tsx
"use client";
import { Avatar as WebAvatar } from "@superbase/react";
import { Avatar as RNAvatar } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-3)", alignItems: "center" };

const webContent = (
  <>
    <Example
      title="이미지 · 폴백"
      description={<><Code>src</Code>가 있으면 이미지, 없거나 실패하면 <Code>name</Code> 이니셜, name도 없으면 아이콘으로 폴백합니다.</>}
      code={`<Avatar src="/u.png" name="Jeong Hoon" />\n<Avatar name="Jeong Hoon" />\n<Avatar />`}
    >
      <div style={row}>
        <WebAvatar name="Jeong Hoon" />
        <WebAvatar name="Soo" />
        <WebAvatar />
      </div>
    </Example>
    <Example
      title="size · shape"
      description={<><Code>size</Code>(sm/md/lg)·<Code>shape</Code>(circle/square)를 지원합니다.</>}
      code={`<Avatar name="A" size="lg" />\n<Avatar name="A" shape="square" />`}
    >
      <div style={row}>
        <WebAvatar name="SM" size="sm" />
        <WebAvatar name="MD" size="md" />
        <WebAvatar name="LG" size="lg" />
        <WebAvatar name="SQ" shape="square" />
      </div>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="이미지 · 폴백"
      description={<><Code>src</Code>가 있으면 이미지, 없거나 실패하면 <Code>name</Code> 이니셜, name도 없으면 아이콘으로 폴백합니다.</>}
      code={`<Avatar name="Jeong Hoon" />\n<Avatar />`}
    >
      <ClientOnly>
        <div style={row}>
          <RNAvatar name="Jeong Hoon" />
          <RNAvatar name="Soo" />
          <RNAvatar />
        </div>
      </ClientOnly>
    </Example>
    <Example
      title="size · shape"
      description={<><Code>size</Code>(sm/md/lg)·<Code>shape</Code>(circle/square)를 지원합니다.</>}
      code={`<Avatar name="A" size="lg" />\n<Avatar name="A" shape="square" />`}
    >
      <ClientOnly>
        <div style={row}>
          <RNAvatar name="SM" size="sm" />
          <RNAvatar name="MD" size="md" />
          <RNAvatar name="LG" size="lg" />
          <RNAvatar name="SQ" shape="square" />
        </div>
      </ClientOnly>
    </Example>
  </>
);

export default function AvatarPage() {
  return (
    <ComponentDoc title="Avatar" lead="사용자 이미지. 실패 시 이니셜·아이콘으로 폴백합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 5: 타입체크 + 빌드**

Run: `pnpm --filter @superbase/docs typecheck` → 0.
Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(`/components/card`, `/components/avatar` 빌드).

- [ ] **Step 6: 커밋**
```bash
git add apps/docs/components/docs/componentNav.ts apps/docs/app/components/card apps/docs/app/components/avatar
git commit -m "docs: Card and Avatar pages + sidebar entries"
```

---

## Task 5: 전체 검증 + changeset

**Files:** Create `.changeset/phase3a1-card-avatar.md`.

- [ ] **Step 1: 전체 검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전 패키지 통과(tokens + Card/Avatar web·RN + 기존 무회귀 + docs 신규 라우트).

- [ ] **Step 2: changeset 작성**

Create `.changeset/phase3a1-card-avatar.md`:
```md
---
"@superbase/tokens": minor
"@superbase/react": minor
"@superbase/react-native": minor
---

신규 컴포넌트: Card(elevation/bordered/padding, shadow 토큰 활용)와 Avatar(이미지 + name 이니셜/user 아이콘 폴백, size sm/md/lg, shape circle/square). 신규 토큰 `--size-avatar-{sm,md,lg}`(32/40/56).
```

- [ ] **Step 3: 커밋**
```bash
git add .changeset/phase3a1-card-avatar.md
git commit -m "chore: changeset for Card + Avatar (3a-1)"
```

---

## 완료 기준 (Definition of Done)
- `pnpm turbo run typecheck test build` 전부 통과. 신규 테스트 통과 + 기존 무회귀.
- Card·Avatar가 웹·RN에서 export되고 API 패리티(elevation/bordered/padding; src/name/size/shape + 폴백). forwardRef.
- 토큰 `size-avatar-*` 추가. docs에 Card/Avatar 페이지 + 사이드바 항목, 빌드 성공.
- changeset로 tokens·react·react-native minor 예약.

## 이후
- **Plan 3a-2 — Tabs**(compound `Tabs/TabList/Tab/TabPanel`, 웹 a11y/키보드). 3a-1 머지 후 작성.
