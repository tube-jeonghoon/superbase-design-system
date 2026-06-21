# Plan B — 나머지 9개 컴포넌트 페이지 Web/Native 탭 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plan A에서 확립한 패턴(`Tabs` Web/React Native + 라이브 프리뷰 + ClientOnly)으로 나머지 9개 컴포넌트 페이지(Icon·Text·Badge·Spinner·Stack·Switch·Checkbox·Radio·TextField)를 변환한다.

**Architecture:** 각 페이지를 `<Tabs items={[{Web}, {React Native}]}>`로 감싼다. Web 탭 = `@superbase/react` 라이브 + 웹 코드(기존 유지). React Native 탭 = `@superbase/react-native` 라이브(react-native-web 렌더, `ClientOnly`로 감쌈) + RN 코드(`onPress`/`onChangeText`/`accessibilityLabel` 등 관용). Icon은 `react-native-svg`를 웹에서 렌더하는 검증 포인트라 **먼저** 한다.

**Tech Stack:** Next.js 15, React 19, react-native-web(인프라는 Plan A에서 완료), TypeScript 5. apps/docs만 변경.

> 전제: Plan A 머지됨 — `next.config.ts`에 react-native→react-native-web 별칭 + transpile, `components/docs/{Tabs,ClientOnly}.tsx` 존재, Button 페이지가 Web/Native 탭 레퍼런스. RN 컴포넌트 API: Text(variant/weight/color), Badge(variant/children:string), Spinner(size/color, **aria-label 없음**), Stack(direction/gap), Switch(checked/onChange/disabled/accessibilityLabel), Checkbox(checked/onChange/disabled/label/accessibilityLabel), RadioGroup(value/onChange)+Radio(value/label/disabled), TextField(label/error/value/**onChangeText**/placeholder), Icon(name/size/color/label). Node 22.

> 모든 페이지 import 경로: 프리미티브 `../../../components/docs/<Name>`.

---

## Task 1: Icon 페이지 Web/Native 탭 (react-native-svg 검증)

**Files:** Rewrite `apps/docs/app/components/icon/page.tsx`

- [ ] **Step 1: 전체 교체**

```tsx
"use client";
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
import { iconNames } from "@superbase/icons";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "var(--spacing-4)",
  width: "100%",
};
const cell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--spacing-1)",
};
const cellLabel: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

const webContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>name</Code>으로 아이콘을, <Code>size</Code>·<Code>color</Code>로 크기와 색을
          정합니다. 기본 색은 텍스트 색을 따릅니다.
        </>
      }
      code={`<Icon name="search" />\n<Icon name="check" size={24} color="var(--color-brand-primary)" />`}
    >
      <WebIcon name="search" />
      <WebIcon name="check" size={24} color="var(--color-brand-primary)" />
    </Example>

    <Example title="전체 아이콘" description="현재 제공하는 모든 아이콘입니다." code={`iconNames.map((name) => <Icon name={name} />)`}>
      <div style={gridStyle}>
        {iconNames.map((n) => (
          <div key={n} style={cell}>
            <WebIcon name={n} size={24} />
            <span style={cellLabel}>{n}</span>
          </div>
        ))}
      </div>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>name</Code>으로 아이콘을, <Code>size</Code>·<Code>color</Code>로 크기와 색을
          정합니다. RN은 기본 색이 토큰 텍스트 색입니다.
        </>
      }
      code={`<Icon name="search" />\n<Icon name="check" size={24} color="#3182f6" />`}
    >
      <ClientOnly>
        <RNIcon name="search" />
        <RNIcon name="check" size={24} color="#3182f6" />
      </ClientOnly>
    </Example>

    <Example title="전체 아이콘" description="현재 제공하는 모든 아이콘입니다." code={`iconNames.map((name) => <Icon name={name} />)`}>
      <ClientOnly>
        <div style={gridStyle}>
          {iconNames.map((n) => (
            <div key={n} style={cell}>
              <RNIcon name={n} size={24} />
              <span style={cellLabel}>{n}</span>
            </div>
          ))}
        </div>
      </ClientOnly>
    </Example>
  </>
);

export default function IconPage() {
  return (
    <ComponentDoc title="Icon" lead="자체 큐레이션한 라인 아이콘 세트. name으로 선택합니다.">
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

- [ ] **Step 2: 빌드 검증 (핵심 — react-native-svg on web)**

Run: `pnpm turbo run build --filter=@superbase/docs`
Expected: `next build` 성공, `/components/icon` 빌드. **RN Icon이 react-native-svg를 통해 웹에서 렌더되도록 번들에 포함**된다(라우트 크기 증가). RN 프리뷰는 ClientOnly라 SSG는 null로 통과.

> 검증/적응: 만약 `react-native-svg` 관련 빌드 에러(예: ESM/web 엔트리 미해석, `Svg`/`Path` undefined)가 나면 보고하고 대응:
> - `transpilePackages`에 `react-native-svg` 포함 확인(Plan A에서 추가됨).
> - `react-native-svg`의 web 구현이 `.web.js`로 해석되도록 `next.config`의 `resolve.extensions`에 web 확장자 포함 확인.
> - 그래도 안 되면 RN Icon 프리뷰만 `next/dynamic(() => import(...), { ssr:false })`로 분리하고 보고.
> 의도(웹+RN 아이콘 둘 다 라이브)는 유지.

- [ ] **Step 3: typecheck + commit**

Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/icon/page.tsx
git commit -m "feat(docs): Icon page Web/React Native tabs (react-native-svg on web)"
```

---

## Task 2: 비인터랙티브 페이지 — Text · Badge · Spinner · Stack

**Files:** Rewrite `apps/docs/app/components/{text,badge,spinner,stack}/page.tsx`

- [ ] **Step 1: `text/page.tsx` 전체 교체**

```tsx
"use client";
import { Text as WebText } from "@superbase/react";
import { Text as RNText } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "var(--spacing-1)" };

const webContent = (
  <>
    <Example
      title="variant"
      description={<><Code>variant</Code>로 크기 단계를 정합니다. caption·body·title·display를 지원합니다.</>}
      code={`<Text variant="display" weight="bold">Display</Text>\n<Text variant="title" weight="bold">Title</Text>\n<Text variant="body">Body</Text>\n<Text variant="caption" color="secondary">Caption</Text>`}
    >
      <div style={col}>
        <WebText variant="display" weight="bold">Display</WebText>
        <WebText variant="title" weight="bold">Title</WebText>
        <WebText variant="body">Body</WebText>
        <WebText variant="caption" color="secondary">Caption</WebText>
      </div>
    </Example>
    <Example
      title="색상"
      description={<><Code>color</Code>로 의미 색을 지정합니다. primary·secondary·brand 등.</>}
      code={`<Text color="primary">Primary</Text>\n<Text color="secondary">Secondary</Text>\n<Text color="brand">Brand</Text>`}
    >
      <div style={col}>
        <WebText color="primary">Primary</WebText>
        <WebText color="secondary">Secondary</WebText>
        <WebText color="brand">Brand</WebText>
      </div>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="variant"
      description={<><Code>variant</Code>로 크기 단계를 정합니다. caption·body·title·display를 지원합니다.</>}
      code={`<Text variant="display" weight="bold">Display</Text>\n<Text variant="title" weight="bold">Title</Text>\n<Text variant="body">Body</Text>\n<Text variant="caption" color="secondary">Caption</Text>`}
    >
      <ClientOnly>
        <div style={col}>
          <RNText variant="display" weight="bold">Display</RNText>
          <RNText variant="title" weight="bold">Title</RNText>
          <RNText variant="body">Body</RNText>
          <RNText variant="caption" color="secondary">Caption</RNText>
        </div>
      </ClientOnly>
    </Example>
    <Example
      title="색상"
      description={<><Code>color</Code>로 의미 색을 지정합니다. primary·secondary·brand 등.</>}
      code={`<Text color="primary">Primary</Text>\n<Text color="secondary">Secondary</Text>\n<Text color="brand">Brand</Text>`}
    >
      <ClientOnly>
        <div style={col}>
          <RNText color="primary">Primary</RNText>
          <RNText color="secondary">Secondary</RNText>
          <RNText color="brand">Brand</RNText>
        </div>
      </ClientOnly>
    </Example>
  </>
);

export default function TextPage() {
  return (
    <ComponentDoc title="Text" lead="타이포그래피 토큰을 적용하는 텍스트 컴포넌트입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: `badge/page.tsx` 전체 교체**

```tsx
"use client";
import { Badge as WebBadge } from "@superbase/react";
import { Badge as RNBadge } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const desc = (
  <>
    <Code>variant</Code>로 의미별 색을 지정합니다. neutral·brand·success·warning·danger를 지원합니다.
  </>
);
const code = `<Badge>Neutral</Badge>\n<Badge variant="brand">Brand</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>\n<Badge variant="danger">Danger</Badge>`;

const webContent = (
  <Example title="variant" description={desc} code={code}>
    <WebBadge>Neutral</WebBadge>
    <WebBadge variant="brand">Brand</WebBadge>
    <WebBadge variant="success">Success</WebBadge>
    <WebBadge variant="warning">Warning</WebBadge>
    <WebBadge variant="danger">Danger</WebBadge>
  </Example>
);
const nativeContent = (
  <Example title="variant" description={desc} code={code}>
    <ClientOnly>
      <RNBadge>Neutral</RNBadge>
      <RNBadge variant="brand">Brand</RNBadge>
      <RNBadge variant="success">Success</RNBadge>
      <RNBadge variant="warning">Warning</RNBadge>
      <RNBadge variant="danger">Danger</RNBadge>
    </ClientOnly>
  </Example>
);

export default function BadgePage() {
  return (
    <ComponentDoc title="Badge" lead="상태나 분류를 작은 라벨로 표시합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 3: `spinner/page.tsx` 전체 교체** (RN Spinner는 `aria-label` 없음 → 코드/프리뷰에서 제거)

```tsx
"use client";
import { Spinner as WebSpinner } from "@superbase/react";
import { Spinner as RNSpinner } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const desc = (
  <>
    <Code>size</Code>로 크기를 정합니다. <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>를 지원합니다.
  </>
);

const webContent = (
  <Example title="크기" description={desc} code={`<Spinner size="sm" aria-label="로딩 중" />\n<Spinner size="md" aria-label="로딩 중" />\n<Spinner size="lg" aria-label="로딩 중" />`}>
    <WebSpinner size="sm" aria-label="로딩 sm" />
    <WebSpinner size="md" aria-label="로딩 md" />
    <WebSpinner size="lg" aria-label="로딩 lg" />
  </Example>
);
const nativeContent = (
  <Example title="크기" description={desc} code={`<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`}>
    <ClientOnly>
      <RNSpinner size="sm" />
      <RNSpinner size="md" />
      <RNSpinner size="lg" />
    </ClientOnly>
  </Example>
);

export default function SpinnerPage() {
  return (
    <ComponentDoc title="Spinner" lead="로딩 중임을 나타내는 회전 인디케이터입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 4: `stack/page.tsx` 전체 교체** (RN 박스는 `react-native`의 `View` 사용 — 별칭으로 RNW)

```tsx
"use client";
import { Stack as WebStack } from "@superbase/react";
import { Stack as RNStack } from "@superbase/react-native";
import { View } from "react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

function WebBox() {
  return <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: "var(--color-brand-primary)" }} />;
}
function RNBox() {
  return <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#3182f6" }} />;
}

const descRow = (
  <>
    <Code>direction</Code>으로 방향을, <Code>gap</Code>으로 간격(스페이싱 스케일)을 정합니다.
  </>
);
const descCol = <><Code>direction="column"</Code>으로 세로로 쌓습니다.</>;

const webContent = (
  <>
    <Example title="방향과 간격" description={descRow} code={`<Stack direction="row" gap={3}>\n  <Box /> <Box /> <Box />\n</Stack>`}>
      <WebStack direction="row" gap={3}><WebBox /><WebBox /><WebBox /></WebStack>
    </Example>
    <Example title="세로 정렬" description={descCol} code={`<Stack direction="column" gap={2}>\n  <Box /> <Box />\n</Stack>`}>
      <WebStack direction="column" gap={2}><WebBox /><WebBox /></WebStack>
    </Example>
  </>
);
const nativeContent = (
  <>
    <Example title="방향과 간격" description={descRow} code={`<Stack direction="row" gap={3}>\n  <Box /> <Box /> <Box />\n</Stack>`}>
      <ClientOnly><RNStack direction="row" gap={3}><RNBox /><RNBox /><RNBox /></RNStack></ClientOnly>
    </Example>
    <Example title="세로 정렬" description={descCol} code={`<Stack direction="column" gap={2}>\n  <Box /> <Box />\n</Stack>`}>
      <ClientOnly><RNStack direction="column" gap={2}><RNBox /><RNBox /></RNStack></ClientOnly>
    </Example>
  </>
);

export default function StackPage() {
  return (
    <ComponentDoc title="Stack" lead="자식 요소를 가로/세로로 정렬하는 레이아웃 프리미티브입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 5: 빌드 + typecheck + commit**

Run: `pnpm turbo run build --filter=@superbase/docs` → 성공(4개 라우트).
Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/text apps/docs/app/components/badge apps/docs/app/components/spinner apps/docs/app/components/stack
git commit -m "feat(docs): Web/RN tabs for Text, Badge, Spinner, Stack"
```

---

## Task 3: 인터랙티브 페이지 — Switch · Checkbox · Radio · TextField

> 인터랙티브 데모는 web/RN 상태를 **분리**한다(독립). 상태 hook은 컴포넌트 안에서 선언하고, content를 컴포넌트 내부에서 만든다.

**Files:** Rewrite `apps/docs/app/components/{switch,checkbox,radio,textfield}/page.tsx`

- [ ] **Step 1: `switch/page.tsx` 전체 교체**

```tsx
"use client";
import { useState } from "react";
import { Switch as WebSwitch, Text as WebText } from "@superbase/react";
import { Switch as RNSwitch, Text as RNText } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const basicDesc = <><Code>checked</Code>와 <Code>onChange</Code>로 제어합니다.</>;
const disabledDesc = <><Code>disabled</Code>로 비활성화합니다.</>;

export default function SwitchPage() {
  const [webOn, setWebOn] = useState(false);
  const [rnOn, setRnOn] = useState(false);

  const webContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<Switch checked={on} onChange={setOn} aria-label="알림" />\n<Text color="secondary">{on ? "On" : "Off"}</Text>`}>
        <WebSwitch checked={webOn} onChange={setWebOn} aria-label="알림" />
        <WebText variant="body" color="secondary">{webOn ? "On" : "Off"}</WebText>
      </Example>
      <Example title="비활성" description={disabledDesc} code={`<Switch checked disabled aria-label="비활성" />`}>
        <WebSwitch checked disabled aria-label="비활성" />
      </Example>
    </>
  );
  const nativeContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<Switch checked={on} onChange={setOn} accessibilityLabel="알림" />\n<Text color="secondary">{on ? "On" : "Off"}</Text>`}>
        <ClientOnly>
          <RNSwitch checked={rnOn} onChange={setRnOn} accessibilityLabel="알림" />
          <RNText variant="body" color="secondary">{rnOn ? "On" : "Off"}</RNText>
        </ClientOnly>
      </Example>
      <Example title="비활성" description={disabledDesc} code={`<Switch checked disabled accessibilityLabel="비활성" />`}>
        <ClientOnly><RNSwitch checked disabled accessibilityLabel="비활성" /></ClientOnly>
      </Example>
    </>
  );

  return (
    <ComponentDoc title="Switch" lead="설정을 즉시 켜고 끄는 토글입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 2: `checkbox/page.tsx` 전체 교체**

```tsx
"use client";
import { useState } from "react";
import { Checkbox as WebCheckbox } from "@superbase/react";
import { Checkbox as RNCheckbox } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const basicDesc = <><Code>checked</Code>와 <Code>onChange</Code>로 제어하고, <Code>label</Code>로 설명을 붙입니다.</>;
const disabledDesc = <><Code>disabled</Code>로 비활성화합니다.</>;

export default function CheckboxPage() {
  const [webChecked, setWebChecked] = useState(false);
  const [rnChecked, setRnChecked] = useState(false);

  const webContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<Checkbox checked={checked} onChange={setChecked} label="약관에 동의합니다" />`}>
        <WebCheckbox checked={webChecked} onChange={setWebChecked} label="약관에 동의합니다" />
      </Example>
      <Example title="비활성" description={disabledDesc} code={`<Checkbox checked disabled label="비활성(선택됨)" />`}>
        <WebCheckbox checked disabled label="비활성(선택됨)" />
      </Example>
    </>
  );
  const nativeContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<Checkbox checked={checked} onChange={setChecked} label="약관에 동의합니다" />`}>
        <ClientOnly><RNCheckbox checked={rnChecked} onChange={setRnChecked} label="약관에 동의합니다" /></ClientOnly>
      </Example>
      <Example title="비활성" description={disabledDesc} code={`<Checkbox checked disabled label="비활성(선택됨)" />`}>
        <ClientOnly><RNCheckbox checked disabled label="비활성(선택됨)" /></ClientOnly>
      </Example>
    </>
  );

  return (
    <ComponentDoc title="Checkbox" lead="여러 항목을 독립적으로 켜고 끌 때 사용합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 3: `radio/page.tsx` 전체 교체**

```tsx
"use client";
import { useState } from "react";
import { RadioGroup as WebRadioGroup, Radio as WebRadio } from "@superbase/react";
import { RadioGroup as RNRadioGroup, Radio as RNRadio } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const desc = (
  <>
    <Code>RadioGroup</Code>의 <Code>value</Code>·<Code>onChange</Code>로 선택을 제어하고, 각 <Code>Radio</Code>는 <Code>value</Code>를 가집니다.
  </>
);
const code = `<RadioGroup value={plan} onChange={setPlan} aria-label="요금제">\n  <Radio value="basic" label="Basic" />\n  <Radio value="pro" label="Pro" />\n  <Radio value="enterprise" label="Enterprise" disabled />\n</RadioGroup>`;

export default function RadioPage() {
  const [webPlan, setWebPlan] = useState("basic");
  const [rnPlan, setRnPlan] = useState("basic");

  const webContent = (
    <Example title="기본 사용" description={desc} code={code}>
      <WebRadioGroup value={webPlan} onChange={setWebPlan} aria-label="요금제">
        <WebRadio value="basic" label="Basic" />
        <WebRadio value="pro" label="Pro" />
        <WebRadio value="enterprise" label="Enterprise" disabled />
      </WebRadioGroup>
    </Example>
  );
  const nativeContent = (
    <Example title="기본 사용" description={desc} code={code}>
      <ClientOnly>
        <RNRadioGroup value={rnPlan} onChange={setRnPlan}>
          <RNRadio value="basic" label="Basic" />
          <RNRadio value="pro" label="Pro" />
          <RNRadio value="enterprise" label="Enterprise" disabled />
        </RNRadioGroup>
      </ClientOnly>
    </Example>
  );

  return (
    <ComponentDoc title="Radio" lead="여러 항목 중 하나만 선택할 때 사용합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

> 주: RN `RadioGroup`은 `aria-label`을 받지 않으므로(웹만 있음) RN 프리뷰에서 제거. RN `Radio`/`RadioGroup` API는 value/onChange/value/label로 웹과 동일.

- [ ] **Step 4: `textfield/page.tsx` 전체 교체** (RN은 `onChange`가 아니라 `onChangeText`)

```tsx
"use client";
import { useState } from "react";
import { TextField as WebTextField } from "@superbase/react";
import { TextField as RNTextField } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const box: React.CSSProperties = { maxWidth: 320, width: "100%" };
const basicDesc = <><Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChange</Code>로 값을 제어합니다.</>;
const basicDescRN = <><Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChangeText</Code>로 값을 제어합니다.</>;
const errorDesc = <><Code>error</Code>로 에러 메시지를 표시합니다.</>;

export default function TextFieldPage() {
  const [webName, setWebName] = useState("");
  const [rnName, setRnName] = useState("");

  const webContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />`}>
        <div style={box}><WebTextField label="이름" placeholder="이름을 입력하세요" value={webName} onChange={setWebName} /></div>
      </Example>
      <Example title="에러" description={errorDesc} code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}>
        <div style={box}><WebTextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" /></div>
      </Example>
    </>
  );
  const nativeContent = (
    <>
      <Example title="기본 사용" description={basicDescRN} code={`<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChangeText={setName} />`}>
        <ClientOnly><div style={box}><RNTextField label="이름" placeholder="이름을 입력하세요" value={rnName} onChangeText={setRnName} /></div></ClientOnly>
      </Example>
      <Example title="에러" description={errorDesc} code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}>
        <ClientOnly><div style={box}><RNTextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" /></div></ClientOnly>
      </Example>
    </>
  );

  return (
    <ComponentDoc title="TextField" lead="한 줄 텍스트를 입력받는 필드입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
```

- [ ] **Step 5: 빌드 + typecheck + commit**

Run: `pnpm turbo run build --filter=@superbase/docs` → 성공.
Run: `pnpm --filter @superbase/docs typecheck` → exit 0.
```bash
git add apps/docs/app/components/switch apps/docs/app/components/checkbox apps/docs/app/components/radio apps/docs/app/components/textfield
git commit -m "feat(docs): Web/RN tabs for Switch, Checkbox, Radio, TextField"
```

---

## Task 4: 전체 검증

- [ ] **Step 1: 전체 빌드/검증**

Run: `pnpm turbo run typecheck test build`
Expected: 전부 통과. `next build` 라우트 표에 9개 `/components/<slug>`(+ button) 모두 존재. (RNW 0.19+React19의 react-dom legacy export warning은 비치명 — 보고만.)

- [ ] **Step 2: 라우트 확인 (보고용)**

Run: `pnpm --filter @superbase/docs build 2>&1 | grep -E "/components"`
Expected: badge·button·checkbox·icon·radio·spinner·stack·switch·text·textfield 모두 빌드.

> changeset 없음(docs 비공개).

---

## 완료 기준 (Definition of Done)

- `pnpm turbo run typecheck test build` 전부 통과.
- 9개 컴포넌트 페이지(+ Button) 모두 `Web` / `React Native` 탭을 갖고, 각 탭이 해당 플랫폼 컴포넌트를 라이브 렌더 + 그 플랫폼 코드를 보여준다.
- Icon RN 탭이 react-native-svg로 웹에서 렌더된다(검증).
- RN 프리뷰는 `ClientOnly`로 마운트 후 렌더.

## 이후
- 머지 후 `/components/icon` 등에서 RN 탭 시각 확인.
- (범위 밖) RNW react-dom legacy warning 정리, 모바일 프레임 안 RN 프리뷰, RN secondary 색 파리티.
