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
    <>
      <Example title="기본 사용" description={desc} code={code}>
        <WebRadioGroup value={webPlan} onChange={setWebPlan} aria-label="요금제">
          <WebRadio value="basic" label="Basic" />
          <WebRadio value="pro" label="Pro" />
          <WebRadio value="enterprise" label="Enterprise" disabled />
        </WebRadioGroup>
      </Example>
      <Example
        title="size"
        description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
        code={`<Radio value="a" label="Small" size="sm" />`}
      >
        <WebRadioGroup value="a" onChange={() => {}} aria-label="size">
          <WebRadio value="a" label="Small" size="sm" />
          <WebRadio value="b" label="Medium" />
        </WebRadioGroup>
      </Example>
    </>
  );
  const nativeContent = (
    <>
      <Example title="기본 사용" description={desc} code={code}>
        <ClientOnly>
          <RNRadioGroup value={rnPlan} onChange={setRnPlan}>
            <RNRadio value="basic" label="Basic" />
            <RNRadio value="pro" label="Pro" />
            <RNRadio value="enterprise" label="Enterprise" disabled />
          </RNRadioGroup>
        </ClientOnly>
      </Example>
      <Example
        title="size"
        description={<><Code>size</Code>(sm/md)로 크기를 조절합니다.</>}
        code={`<Radio value="a" label="Small" size="sm" />`}
      >
        <ClientOnly>
          <RNRadioGroup value="a" onChange={() => {}}>
            <RNRadio value="a" label="Small" size="sm" />
            <RNRadio value="b" label="Medium" />
          </RNRadioGroup>
        </ClientOnly>
      </Example>
    </>
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
