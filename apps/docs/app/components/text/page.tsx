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
