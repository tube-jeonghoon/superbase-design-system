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
