# Plan 8 — 나머지 8개 컴포넌트 문서 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Button 페이지와 동일한 문서 프리미티브로 나머지 8개 컴포넌트(Badge, Checkbox, Radio, Spinner, Stack, Switch, Text, TextField)의 페이지를 만든다.

**Architecture:** 각 페이지는 `app/components/<slug>/page.tsx`로, `ComponentDoc`(제목+리드)와 `Example`(설명+라이브 프리뷰+코드) 프리미티브를 사용해 실제 `@superbase/react` 컴포넌트를 렌더하고 사용 코드를 문자열로 보여준다. 인터랙티브 데모는 페이지 내부 `useState`로 제어한다. 모든 페이지는 `"use client"`(라이브 컴포넌트가 클라이언트 번들이므로 일관되게).

**Tech Stack:** Next.js 15 App Router, React 19, `@superbase/react`, 기존 문서 프리미티브(`ComponentDoc`/`Example`/`Code`/`CodeBlock`).

> 전제: Plan 7이 `main`에 머지됨. `apps/docs/components/docs/`에 `ComponentDoc`, `Example`, `Code`가 있고 `/components/button`이 레퍼런스로 존재. 사이드바 `componentNav`에 9개 slug가 이미 등록됨(badge/checkbox/radio/spinner/stack/switch/text/textfield 포함). 컴포넌트 API: Badge(variant), Checkbox(checked/onChange/disabled/label), RadioGroup(value/onChange/aria-label)+Radio(value/label/disabled), Spinner(size/aria-label), Stack(direction/gap/padding/align/justify), Switch(checked/onChange/disabled/aria-label), Text(variant/weight/color/as), TextField(label/error/value/onChange/placeholder). Node 22, pnpm 10.27.0.

> import 경로: 각 페이지 `app/components/<slug>/page.tsx`에서 프리미티브는 `../../../components/docs/<Name>`.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `apps/docs/app/components/badge/page.tsx` | Badge 페이지 |
| `apps/docs/app/components/checkbox/page.tsx` | Checkbox 페이지 |
| `apps/docs/app/components/radio/page.tsx` | Radio 페이지 |
| `apps/docs/app/components/spinner/page.tsx` | Spinner 페이지 |
| `apps/docs/app/components/stack/page.tsx` | Stack 페이지 |
| `apps/docs/app/components/switch/page.tsx` | Switch 페이지 |
| `apps/docs/app/components/text/page.tsx` | Text 페이지 |
| `apps/docs/app/components/textfield/page.tsx` | TextField 페이지 |

---

## Task 1: Badge 페이지

**Files:** Create `apps/docs/app/components/badge/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { Badge } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function BadgePage() {
  return (
    <ComponentDoc title="Badge" lead="상태나 분류를 작은 라벨로 표시합니다.">
      <Example
        title="variant"
        description={
          <>
            <Code>variant</Code>로 의미별 색을 지정합니다. neutral·brand·success·warning·danger를
            지원합니다.
          </>
        }
        code={`<Badge>Neutral</Badge>\n<Badge variant="brand">Brand</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>\n<Badge variant="danger">Danger</Badge>`}
      >
        <Badge>Neutral</Badge>
        <Badge variant="brand">Brand</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/badge
git commit -m "feat(docs): add Badge page"
```

---

## Task 2: Checkbox 페이지

**Files:** Create `apps/docs/app/components/checkbox/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { useState } from "react";
import { Checkbox } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function CheckboxPage() {
  const [checked, setChecked] = useState(false);
  return (
    <ComponentDoc title="Checkbox" lead="여러 항목을 독립적으로 켜고 끌 때 사용합니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>checked</Code>와 <Code>onChange</Code>로 제어하고, <Code>label</Code>로 설명을
            붙입니다.
          </>
        }
        code={`const [checked, setChecked] = useState(false);\n<Checkbox checked={checked} onChange={setChecked} label="약관에 동의합니다" />`}
      >
        <Checkbox checked={checked} onChange={setChecked} label="약관에 동의합니다" />
      </Example>

      <Example
        title="비활성"
        description={
          <>
            <Code>disabled</Code>로 비활성화합니다.
          </>
        }
        code={`<Checkbox checked disabled label="비활성(선택됨)" />`}
      >
        <Checkbox checked disabled label="비활성(선택됨)" />
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/checkbox
git commit -m "feat(docs): add Checkbox page"
```

---

## Task 3: Radio 페이지

**Files:** Create `apps/docs/app/components/radio/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { useState } from "react";
import { RadioGroup, Radio } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function RadioPage() {
  const [plan, setPlan] = useState("basic");
  return (
    <ComponentDoc title="Radio" lead="여러 항목 중 하나만 선택할 때 사용합니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>RadioGroup</Code>의 <Code>value</Code>·<Code>onChange</Code>로 선택을 제어하고,
            각 <Code>Radio</Code>는 <Code>value</Code>를 가집니다.
          </>
        }
        code={`const [plan, setPlan] = useState("basic");\n<RadioGroup value={plan} onChange={setPlan} aria-label="요금제">\n  <Radio value="basic" label="Basic" />\n  <Radio value="pro" label="Pro" />\n  <Radio value="enterprise" label="Enterprise" disabled />\n</RadioGroup>`}
      >
        <RadioGroup value={plan} onChange={setPlan} aria-label="요금제">
          <Radio value="basic" label="Basic" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Enterprise" disabled />
        </RadioGroup>
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/radio
git commit -m "feat(docs): add Radio page"
```

---

## Task 4: Spinner 페이지

**Files:** Create `apps/docs/app/components/spinner/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { Spinner } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function SpinnerPage() {
  return (
    <ComponentDoc title="Spinner" lead="로딩 중임을 나타내는 회전 인디케이터입니다.">
      <Example
        title="크기"
        description={
          <>
            <Code>size</Code>로 크기를 정합니다. <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>를
            지원합니다.
          </>
        }
        code={`<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`}
      >
        <Spinner size="sm" aria-label="로딩 sm" />
        <Spinner size="md" aria-label="로딩 md" />
        <Spinner size="lg" aria-label="로딩 lg" />
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/spinner
git commit -m "feat(docs): add Spinner page"
```

---

## Task 5: Stack 페이지

**Files:** Create `apps/docs/app/components/stack/page.tsx`

- [ ] **Step 1: 작성** (프리뷰용 박스는 인라인 스타일 div를 사용)

```tsx
"use client";
import { Stack } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

function Box() {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--radius-sm)",
        background: "var(--color-brand-primary)",
      }}
    />
  );
}

export default function StackPage() {
  return (
    <ComponentDoc title="Stack" lead="자식 요소를 가로/세로로 정렬하는 레이아웃 프리미티브입니다.">
      <Example
        title="방향과 간격"
        description={
          <>
            <Code>direction</Code>으로 방향을, <Code>gap</Code>으로 간격(스페이싱 스케일)을 정합니다.
          </>
        }
        code={`<Stack direction="row" gap={3}>\n  <Box /> <Box /> <Box />\n</Stack>`}
      >
        <Stack direction="row" gap={3}>
          <Box />
          <Box />
          <Box />
        </Stack>
      </Example>

      <Example
        title="세로 정렬"
        description={
          <>
            <Code>direction="column"</Code>으로 세로로 쌓습니다.
          </>
        }
        code={`<Stack direction="column" gap={2}>\n  <Box /> <Box />\n</Stack>`}
      >
        <Stack direction="column" gap={2}>
          <Box />
          <Box />
        </Stack>
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/stack
git commit -m "feat(docs): add Stack page"
```

---

## Task 6: Switch 페이지

**Files:** Create `apps/docs/app/components/switch/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { useState } from "react";
import { Switch, Text } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function SwitchPage() {
  const [on, setOn] = useState(false);
  return (
    <ComponentDoc title="Switch" lead="설정을 즉시 켜고 끄는 토글입니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>checked</Code>와 <Code>onChange</Code>로 제어합니다.
          </>
        }
        code={`const [on, setOn] = useState(false);\n<Switch checked={on} onChange={setOn} aria-label="알림" />`}
      >
        <Switch checked={on} onChange={setOn} aria-label="알림" />
        <Text variant="body" color="secondary">
          {on ? "On" : "Off"}
        </Text>
      </Example>

      <Example
        title="비활성"
        description={
          <>
            <Code>disabled</Code>로 비활성화합니다.
          </>
        }
        code={`<Switch checked disabled aria-label="비활성" />`}
      >
        <Switch checked disabled aria-label="비활성" />
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/switch
git commit -m "feat(docs): add Switch page"
```

---

## Task 7: Text 페이지

**Files:** Create `apps/docs/app/components/text/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { Text } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function TextPage() {
  return (
    <ComponentDoc title="Text" lead="타이포그래피 토큰을 적용하는 텍스트 컴포넌트입니다.">
      <Example
        title="variant"
        description={
          <>
            <Code>variant</Code>로 크기 단계를 정합니다. caption·body·title·display를 지원합니다.
          </>
        }
        code={`<Text variant="display" weight="bold">Display</Text>\n<Text variant="title" weight="bold">Title</Text>\n<Text variant="body">Body</Text>\n<Text variant="caption" color="secondary">Caption</Text>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
          <Text variant="display" weight="bold">
            Display
          </Text>
          <Text variant="title" weight="bold">
            Title
          </Text>
          <Text variant="body">Body</Text>
          <Text variant="caption" color="secondary">
            Caption
          </Text>
        </div>
      </Example>

      <Example
        title="색상"
        description={
          <>
            <Code>color</Code>로 의미 색을 지정합니다. primary·secondary·brand 등.
          </>
        }
        code={`<Text color="primary">Primary</Text>\n<Text color="secondary">Secondary</Text>\n<Text color="brand">Brand</Text>`}
      >
        <Text color="primary">Primary</Text>
        <Text color="secondary">Secondary</Text>
        <Text color="brand">Brand</Text>
      </Example>
    </ComponentDoc>
  );
}
```

> 참고: Example의 `.canvas`는 `flex-direction: row`라 텍스트가 가로로 늘어선다. variant 비교는 세로가 자연스러우므로 위처럼 자식을 `column` div로 감쌌다.

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/text
git commit -m "feat(docs): add Text page"
```

---

## Task 8: TextField 페이지

**Files:** Create `apps/docs/app/components/textfield/page.tsx`

- [ ] **Step 1: 작성**

```tsx
"use client";
import { useState } from "react";
import { TextField } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function TextFieldPage() {
  const [name, setName] = useState("");
  return (
    <ComponentDoc title="TextField" lead="한 줄 텍스트를 입력받는 필드입니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChange</Code>로 값을 제어합니다.
          </>
        }
        code={`const [name, setName] = useState("");\n<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />`}
      >
        <div style={{ maxWidth: 320, width: "100%" }}>
          <TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />
        </div>
      </Example>

      <Example
        title="에러"
        description={
          <>
            <Code>error</Code>로 에러 메시지를 표시합니다.
          </>
        }
        code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}
      >
        <div style={{ maxWidth: 320, width: "100%" }}>
          <TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />
        </div>
      </Example>
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/textfield
git commit -m "feat(docs): add TextField page"
```

---

## Task 9: 전체 검증

- [ ] **Step 1: 전체 빌드/검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전부 통과. `next build` 라우트 표에 9개 `/components/<slug>`(button 포함)가 모두 정적 생성된다. 라우트 줄을 보고하라.

- [ ] **Step 2: 라우트 확인 (보고용)**

Run: `pnpm --filter @superbase/docs build 2>&1 | grep -E "/components"` (또는 위 build 출력에서 확인)
Expected: `/components`, `/components/badge`, `/components/button`, `/components/checkbox`, `/components/radio`, `/components/spinner`, `/components/stack`, `/components/switch`, `/components/text`, `/components/textfield` 모두 존재.

> changeset은 만들지 않는다(문서 사이트는 비공개·미배포).

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build`가 전부 통과한다.
- 9개 컴포넌트 모두 `/components/<slug>` 페이지를 갖고, 각 페이지가 설명+프리뷰+코드(복사)로 구성된다.
- 사이드바의 모든 항목이 실제 페이지로 연결된다(더 이상 404 없음).

## 이후 (사용자 순서)

- **아이콘 세트** → 문서 사이트 배포(Vercel) → vite 버전 정합.
