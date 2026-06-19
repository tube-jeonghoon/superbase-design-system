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
