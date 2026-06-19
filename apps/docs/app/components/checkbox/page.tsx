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
