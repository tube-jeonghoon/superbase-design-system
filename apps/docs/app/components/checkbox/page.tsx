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
      <Example
        title="indeterminate"
        description={<><Code>indeterminate</Code>로 부분 선택(혼합) 상태를 표시합니다.</>}
        code={`<Checkbox indeterminate checked={false} label="전체 선택" />`}
      >
        <WebCheckbox indeterminate checked={false} label="전체 선택" />
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
      <Example
        title="indeterminate"
        description={<><Code>indeterminate</Code>로 부분 선택(혼합) 상태를 표시합니다.</>}
        code={`<Checkbox indeterminate checked={false} label="전체 선택" />`}
      >
        <ClientOnly><RNCheckbox indeterminate checked={false} label="전체 선택" /></ClientOnly>
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
