# Plan A — react-native-web 인프라 + Button POC (Web/Native 탭) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** docs 사이트에 react-native-web을 설정해 `@superbase/react-native` 컴포넌트를 웹에서 라이브 렌더하고, Button 페이지를 `Web` / `React Native` 탭으로 변환해 두 플랫폼을 라이브로 비교한다(POC).

**Architecture:** Next에서 `react-native` import를 `react-native-web`으로 별칭(webpack/turbopack)하고 `@superbase/react-native`·`react-native-web`·`react-native-svg`를 transpile한다. 타입은 실제 `react-native`(devDep)에서, 런타임은 react-native-web에서. RN 라이브 프리뷰는 SSR 리스크 회피를 위해 `ClientOnly`로 마운트 후에만 렌더한다. 기존 `Tabs`를 docs 공용으로 옮겨 페이지의 Web/Native 탭에 재사용한다.

**Tech Stack:** Next.js 15, React 19, react-native-web 0.19, react-native(types) 0.86, TypeScript 5, Vitest. apps/docs만 변경.

> 전제: 문서 사이트 동작 중. `Tabs`는 `apps/docs/components/foundations/Tabs.tsx`(+ `.module.css`, `.test.tsx`)에 있고 Foundations 페이지가 `../../components/foundations/Tabs`로 import. `@superbase/react-native`는 빌드된 dist(js+d.ts)로 Button 등 export. docs는 `@superbase/react`·`@superbase/tokens`·`@superbase/icons` 의존. Node 22, pnpm 10.27.0.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `apps/docs/package.json` (수정) | react-native-web·react-native-svg·@superbase/react-native 추가, react-native(types) devDep |
| `apps/docs/next.config.ts` (수정) | react-native→react-native-web 별칭 + transpilePackages |
| `apps/docs/components/docs/ClientOnly.tsx` | 마운트 후에만 children 렌더(RN 프리뷰 SSR 회피) |
| `apps/docs/components/docs/Tabs.tsx` `+ .module.css` `+ .test.tsx` | foundations/에서 이동(공용) |
| `apps/docs/app/foundations/page.tsx` (수정) | Tabs import 경로 갱신 |
| `apps/docs/app/components/button/page.tsx` (재작성) | Web/Native 탭 |

---

## Task 1: react-native-web 인프라 + ClientOnly

**Files:** Modify `apps/docs/package.json`, `apps/docs/next.config.ts`; Create `apps/docs/components/docs/ClientOnly.tsx`

- [ ] **Step 1: `apps/docs/package.json` 의존성 추가**

`dependencies`에 추가(객체 내 적당 위치, 알파벳 무관):
```json
    "@superbase/react-native": "workspace:*",
    "react-native-svg": "^15.0.0",
    "react-native-web": "^0.19.13",
```
`devDependencies`에 추가(타입용 실제 react-native):
```json
    "react-native": "^0.86.0",
```

- [ ] **Step 2: `apps/docs/next.config.ts` 전체를 교체**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@superbase/react",
    "@superbase/react-native",
    "@superbase/tokens",
    "@superbase/icons",
    "react-native-web",
    "react-native-svg",
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ...(config.resolve.extensions ?? []),
    ];
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
  },
};

export default nextConfig;
```

> webpack `react-native$`는 정확매칭이라 `react-native-svg`/`react-native-web`은 별칭 대상 아님. `.web.*` 확장자 우선으로 react-native-web/svg의 웹 구현이 선택된다. 빌드는 webpack(`next build`), dev도 기본 webpack이라 webpack 별칭으로 충분. turbopack 키는 `--turbopack` 사용 대비 안전망.

- [ ] **Step 3: `apps/docs/components/docs/ClientOnly.tsx`**

```tsx
"use client";
import { useEffect, useState, type ReactNode } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}
```

- [ ] **Step 4: 설치**

Run: `pnpm install`
Expected: react-native-web(0.19.x)·react-native-svg(15.x)·react-native(0.86.x) 설치. `@superbase/react-native` 워크스페이스 링크. (peer 경고는 무시 가능 — 보고만.)

- [ ] **Step 5: 베이스라인 빌드 (RN 미사용 상태에서 설정만 검증)**

Run: `pnpm turbo run build --filter=@superbase/docs`
Expected: `next build` 성공(아직 RN을 import하는 페이지 없음 — 설정이 기존 빌드를 깨지 않는지 확인).
Run: `pnpm --filter @superbase/docs typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/package.json apps/docs/next.config.ts apps/docs/components/docs/ClientOnly.tsx pnpm-lock.yaml
git commit -m "feat(docs): set up react-native-web (alias, transpile) + ClientOnly"
```

---

## Task 2: Tabs를 components/docs/로 이동

**Files:** Move `apps/docs/components/foundations/Tabs.tsx` → `apps/docs/components/docs/Tabs.tsx` (+ `.module.css`, `.test.tsx`); Modify `apps/docs/app/foundations/page.tsx`

- [ ] **Step 1: 파일 이동 (git mv)**

```bash
git mv apps/docs/components/foundations/Tabs.tsx apps/docs/components/docs/Tabs.tsx
git mv apps/docs/components/foundations/Tabs.module.css apps/docs/components/docs/Tabs.module.css
git mv apps/docs/components/foundations/Tabs.test.tsx apps/docs/components/docs/Tabs.test.tsx
```
(Tabs.tsx 내부의 `import styles from "./Tabs.module.css"`와 Tabs.test.tsx의 `import { Tabs } from "./Tabs"`는 상대경로라 이동 후에도 그대로 동작한다.)

- [ ] **Step 2: Foundations 페이지의 Tabs import 경로 수정 — `apps/docs/app/foundations/page.tsx`**

`import { Tabs } from "../../components/foundations/Tabs";` 를 아래로 바꾼다:
```tsx
import { Tabs } from "../../components/docs/Tabs";
```

- [ ] **Step 3: 검증**

Run: `pnpm --filter @superbase/docs test` → Tabs 테스트 포함 전부 통과(이동만, 동작 동일).
Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
Run: `grep -rn "components/foundations/Tabs" apps/docs` → 결과 없어야 함(구 경로 참조 없음).

- [ ] **Step 4: Commit**

```bash
git add apps/docs/components/docs/Tabs.tsx apps/docs/components/docs/Tabs.module.css apps/docs/components/docs/Tabs.test.tsx apps/docs/components/foundations/Tabs.tsx apps/docs/components/foundations/Tabs.module.css apps/docs/components/foundations/Tabs.test.tsx apps/docs/app/foundations/page.tsx
git commit -m "refactor(docs): move Tabs to components/docs (shared primitive)"
```

---

## Task 3: Button 페이지 Web/Native 탭 (POC)

**Files:** Rewrite `apps/docs/app/components/button/page.tsx`

- [ ] **Step 1: `apps/docs/app/components/button/page.tsx` 전체를 교체**

```tsx
"use client";
import { Button as WebButton } from "@superbase/react";
import { Button as RNButton } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const webContent = (
  <>
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
      <WebButton variant="primary">확인</WebButton>
      <WebButton variant="secondary">취소</WebButton>
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
      <WebButton size="sm">Small</WebButton>
      <WebButton size="md">Medium</WebButton>
      <WebButton size="lg">Large</WebButton>
    </Example>

    <Example
      title="비활성"
      description={<><Code>disabled</Code>로 버튼을 비활성화합니다.</>}
      code={`<Button disabled>비활성</Button>`}
    >
      <WebButton disabled>비활성</WebButton>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>variant</Code>로 스타일을, <Code>onPress</Code>로 액션을 정합니다.
        </>
      }
      code={`<Button variant="primary" onPress={onConfirm}>확인</Button>\n<Button variant="secondary" onPress={onCancel}>취소</Button>`}
    >
      <ClientOnly>
        <RNButton variant="primary" onPress={() => {}}>확인</RNButton>
        <RNButton variant="secondary" onPress={() => {}}>취소</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="크기 조정하기"
      description={
        <>
          <Code>size</Code>로 크기를 바꿉니다. <Code>sm</Code>, <Code>md</Code>,{" "}
          <Code>lg</Code> 중 하나를 고를 수 있어요.
        </>
      }
      code={`<Button size="sm" onPress={fn}>Small</Button>\n<Button size="md" onPress={fn}>Medium</Button>\n<Button size="lg" onPress={fn}>Large</Button>`}
    >
      <ClientOnly>
        <RNButton size="sm" onPress={() => {}}>Small</RNButton>
        <RNButton size="md" onPress={() => {}}>Medium</RNButton>
        <RNButton size="lg" onPress={() => {}}>Large</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="비활성"
      description={<><Code>disabled</Code>로 버튼을 비활성화합니다.</>}
      code={`<Button disabled onPress={fn}>비활성</Button>`}
    >
      <ClientOnly>
        <RNButton disabled onPress={() => {}}>비활성</RNButton>
      </ClientOnly>
    </Example>
  </>
);

export default function ButtonPage() {
  return (
    <ComponentDoc
      title="Button"
      lead="사용자의 액션을 유도하는 기본 버튼. variant·size·disabled를 지원합니다."
    >
      <Tabs
        ariaLabel="플랫폼"
        items={[
          { id: "web", label: "Web", content: webContent },
          { id: "native", label: "React Native", content: nativeContent },
        ]}
      />
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: 빌드 + 검증 (핵심 POC)**

Run: `pnpm turbo run build --filter=@superbase/docs`
Expected: `next build` 성공. 라우트 표에 `/components/button` 존재. **react-native-web으로 RN Button이 빌드에 포함되고 SSG가 통과**한다(RN 프리뷰는 ClientOnly라 prerender 시 null, 클라이언트에서 마운트).

> 검증/적응: 만약 빌드가 react-native-web/`react-native-svg`/별칭으로 실패하면 정확한 에러를 보고하라. 흔한 원인과 대응:
> - `Module not found: react-native` → webpack `resolve.alias["react-native$"]` 확인.
> - react-native-web ESM/transpile 에러 → `transpilePackages`에 `react-native-web` 포함 확인.
> - typecheck에서 `react-native` 타입 미해석 → devDep `react-native@^0.86` 설치 확인(Task 1).
> 의도(웹+RN 둘 다 라이브, Web/Native 탭)는 유지하고 변경점을 보고하라.

- [ ] **Step 3: typecheck + 전체 검증**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
Run: `pnpm turbo run typecheck test build`
Expected: tokens·react·react-native·icons·docs 전부 통과. docs 테스트 동일(Tabs 이동 외 변화 없음).

- [ ] **Step 4: Commit**

```bash
git add apps/docs/app/components/button/page.tsx
git commit -m "feat(docs): Button page Web/React Native tabs (live RNW preview)"
```

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 전부 통과한다.
- `next build`가 `/components/button`을 성공적으로 빌드한다(react-native-web 라이브 RN 프리뷰 포함).
- Button 페이지에 `Web` / `React Native` 탭이 있고, 각 탭이 해당 플랫폼 Button을 라이브로 렌더 + 그 플랫폼 코드를 보여준다.
- `Tabs`가 `components/docs/`로 옮겨져 공용 프리미티브가 된다.
- RN 프리뷰는 `ClientOnly`로 마운트 후 렌더(SSR 안전).

## 다음 플랜
- **Plan B**: 나머지 9개 페이지(Text·TextField·Stack·Switch·Checkbox·Radio·Badge·Spinner·Icon)를 동일 Web/Native 탭으로 변환. Icon은 `react-native-svg`-on-web 검증.
