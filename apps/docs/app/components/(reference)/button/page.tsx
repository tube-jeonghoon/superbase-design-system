"use client";
import { Button as WebButton } from "@superbase/react";
import { Button as RNButton } from "@superbase/react-native";
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
import { ComponentDoc } from "../../../../components/docs/ComponentDoc";
import { Tabs } from "../../../../components/docs/Tabs";
import { Example } from "../../../../components/docs/Example";
import { Code } from "../../../../components/docs/Code";
import { ClientOnly } from "../../../../components/docs/ClientOnly";

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

    <Example
      title="loading"
      description={<><Code>loading</Code>으로 작업 중 상태를 표시합니다. 스피너가 보이고 클릭이 막힙니다.</>}
      code={`<Button loading>저장 중</Button>`}
    >
      <WebButton loading>저장 중</WebButton>
    </Example>

    <Example
      title="아이콘 슬롯"
      description={<><Code>startIcon</Code>·<Code>endIcon</Code>으로 라벨 양옆에 아이콘을 넣습니다.</>}
      code={`<Button startIcon={<Icon name="check" />}>완료</Button>\n<Button endIcon={<Icon name="chevron-right" />}>다음</Button>`}
    >
      <WebButton startIcon={<WebIcon name="check" />}>완료</WebButton>
      <WebButton variant="secondary" endIcon={<WebIcon name="chevron-right" />}>다음</WebButton>
    </Example>

    <Example
      title="variant 확장"
      description={<><Code>ghost</Code>·<Code>outline</Code> variant를 추가로 지원합니다.</>}
      code={`<Button variant="ghost">Ghost</Button>\n<Button variant="outline">Outline</Button>`}
    >
      <WebButton variant="ghost">Ghost</WebButton>
      <WebButton variant="outline">Outline</WebButton>
    </Example>

    <Example
      title="fullWidth"
      description={<><Code>fullWidth</Code>로 가로를 꽉 채웁니다.</>}
      code={`<Button fullWidth>전체 너비</Button>`}
    >
      <div style={{ width: "100%" }}>
        <WebButton fullWidth>전체 너비</WebButton>
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

    <Example
      title="loading"
      description={<><Code>loading</Code>으로 작업 중 상태를 표시합니다. 스피너가 보이고 onPress가 막힙니다.</>}
      code={`<Button loading onPress={fn}>저장 중</Button>`}
    >
      <ClientOnly>
        <RNButton loading onPress={() => {}}>저장 중</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="아이콘 슬롯"
      description={<><Code>startIcon</Code>·<Code>endIcon</Code>으로 라벨 양옆에 아이콘을 넣습니다.</>}
      code={`<Button startIcon={<Icon name="check" />} onPress={fn}>완료</Button>`}
    >
      <ClientOnly>
        <RNButton startIcon={<RNIcon name="check" color="#ffffff" />} onPress={() => {}}>완료</RNButton>
        <RNButton variant="secondary" endIcon={<RNIcon name="chevron-right" />} onPress={() => {}}>다음</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="variant 확장"
      description={<><Code>ghost</Code>·<Code>outline</Code> variant를 추가로 지원합니다.</>}
      code={`<Button variant="ghost" onPress={fn}>Ghost</Button>\n<Button variant="outline" onPress={fn}>Outline</Button>`}
    >
      <ClientOnly>
        <RNButton variant="ghost" onPress={() => {}}>Ghost</RNButton>
        <RNButton variant="outline" onPress={() => {}}>Outline</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="fullWidth"
      description={<><Code>fullWidth</Code>로 가로를 꽉 채웁니다.</>}
      code={`<Button fullWidth onPress={fn}>전체 너비</Button>`}
    >
      <ClientOnly>
        <RNButton fullWidth onPress={() => {}}>전체 너비</RNButton>
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
    </ComponentDoc>
  );
}
