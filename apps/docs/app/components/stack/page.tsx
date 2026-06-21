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
