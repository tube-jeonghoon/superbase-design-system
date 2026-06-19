"use client";
import { useState } from "react";
import { RadioGroup, Radio } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function RadioPage() {
  const [plan, setPlan] = useState("basic");
  return (
    <ComponentDoc title="Radio" lead="여러 항목 중 하나만 선택할 때 사용합니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>RadioGroup</Code>의 <Code>value</Code>·<Code>onChange</Code>로 선택을 제어하고,
            각 <Code>Radio</Code>는 <Code>value</Code>를 가집니다.
          </>
        }
        code={`const [plan, setPlan] = useState("basic");\n<RadioGroup value={plan} onChange={setPlan} aria-label="요금제">\n  <Radio value="basic" label="Basic" />\n  <Radio value="pro" label="Pro" />\n  <Radio value="enterprise" label="Enterprise" disabled />\n</RadioGroup>`}
      >
        <RadioGroup value={plan} onChange={setPlan} aria-label="요금제">
          <Radio value="basic" label="Basic" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Enterprise" disabled />
        </RadioGroup>
      </Example>
    </ComponentDoc>
  );
}
