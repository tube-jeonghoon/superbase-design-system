"use client";
import { useState } from "react";
import { TextField as WebTextField } from "@superbase/react";
import { TextField as RNTextField } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const box: React.CSSProperties = { maxWidth: 320, width: "100%" };
const basicDesc = <><Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChange</Code>로 값을 제어합니다.</>;
const basicDescRN = <><Code>label</Code>로 라벨을, <Code>value</Code>·<Code>onChangeText</Code>로 값을 제어합니다.</>;
const errorDesc = <><Code>error</Code>로 에러 메시지를 표시합니다.</>;

export default function TextFieldPage() {
  const [webName, setWebName] = useState("");
  const [rnName, setRnName] = useState("");

  const webContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />`}>
        <div style={box}><WebTextField label="이름" placeholder="이름을 입력하세요" value={webName} onChange={setWebName} /></div>
      </Example>
      <Example title="에러" description={errorDesc} code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}>
        <div style={box}><WebTextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" /></div>
      </Example>
    </>
  );
  const nativeContent = (
    <>
      <Example title="기본 사용" description={basicDescRN} code={`<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChangeText={setName} />`}>
        <ClientOnly><div style={box}><RNTextField label="이름" placeholder="이름을 입력하세요" value={rnName} onChangeText={setRnName} /></div></ClientOnly>
      </Example>
      <Example title="에러" description={errorDesc} code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}>
        <ClientOnly><div style={box}><RNTextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" /></div></ClientOnly>
      </Example>
    </>
  );

  return (
    <ComponentDoc title="TextField" lead="한 줄 텍스트를 입력받는 필드입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
