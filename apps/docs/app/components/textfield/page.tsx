"use client";
import { useState } from "react";
import { TextField } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function TextFieldPage() {
  const [name, setName] = useState("");
  return (
    <ComponentDoc title="TextField" lead="한 줄 텍스트를 입력받는 필드입니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChange</Code>로 값을 제어합니다.
          </>
        }
        code={`const [name, setName] = useState("");\n<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />`}
      >
        <div style={{ maxWidth: 320, width: "100%" }}>
          <TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />
        </div>
      </Example>

      <Example
        title="에러"
        description={
          <>
            <Code>error</Code>로 에러 메시지를 표시합니다.
          </>
        }
        code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}
      >
        <div style={{ maxWidth: 320, width: "100%" }}>
          <TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />
        </div>
      </Example>
    </ComponentDoc>
  );
}
