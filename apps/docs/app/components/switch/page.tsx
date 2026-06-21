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
      <Example
        title="size"
        description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
        code={`<Switch size="sm" checked={on} onChange={setOn} />`}
      >
        <WebSwitch size="sm" checked onChange={() => {}} aria-label="sm" />
        <WebSwitch checked onChange={() => {}} aria-label="md" />
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
      <Example
        title="size"
        description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
        code={`<Switch size="sm" checked={on} onChange={setOn} />`}
      >
        <ClientOnly>
          <RNSwitch size="sm" checked onChange={() => {}} accessibilityLabel="sm" />
          <RNSwitch checked onChange={() => {}} accessibilityLabel="md" />
        </ClientOnly>
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
