"use client";
import { useState } from "react";
import { Switch, Text } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function SwitchPage() {
  const [on, setOn] = useState(false);
  return (
    <ComponentDoc title="Switch" lead="설정을 즉시 켜고 끄는 토글입니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>checked</Code>와 <Code>onChange</Code>로 제어합니다.
          </>
        }
        code={`const [on, setOn] = useState(false);\n<Switch checked={on} onChange={setOn} aria-label="알림" />`}
      >
        <Switch checked={on} onChange={setOn} aria-label="알림" />
        <Text variant="body" color="secondary">
          {on ? "On" : "Off"}
        </Text>
      </Example>

      <Example
        title="비활성"
        description={
          <>
            <Code>disabled</Code>로 비활성화합니다.
          </>
        }
        code={`<Switch checked disabled aria-label="비활성" />`}
      >
        <Switch checked disabled aria-label="비활성" />
      </Example>
    </ComponentDoc>
  );
}
