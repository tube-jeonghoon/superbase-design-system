"use client";
import { useState } from "react";
import { TextField as WebTextField } from "@superbase/react";
import { TextField as RNTextField } from "@superbase/react-native";
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
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
  const [clearWeb, setClearWeb] = useState("지울 수 있어요");
  const [clearRn, setClearRn] = useState("지울 수 있어요");

  const webContent = (
    <>
      <Example title="기본 사용" description={basicDesc} code={`<TextField label="이름" placeholder="이름을 입력하세요" value={name} onChange={setName} />`}>
        <div style={box}><WebTextField label="이름" placeholder="이름을 입력하세요" value={webName} onChange={setWebName} /></div>
      </Example>
      <Example title="에러" description={errorDesc} code={`<TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />`}>
        <div style={box}><WebTextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" /></div>
      </Example>
    <Example
      title="size"
      description={<><Code>size</Code>로 높이를 조절합니다(sm/md/lg).</>}
      code={`<TextField size="sm" label="Small" />\n<TextField size="lg" label="Large" />`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
        <WebTextField size="sm" label="Small" placeholder="sm" />
        <WebTextField size="lg" label="Large" placeholder="lg" />
      </div>
    </Example>

    <Example
      title="prefix / suffix"
      description={<><Code>prefix</Code>·<Code>suffix</Code>로 입력칸 좌/우에 아이콘 등을 넣습니다.</>}
      code={`<TextField prefix={<Icon name="search" />} placeholder="검색" />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField prefix={<WebIcon name="search" size={18} />} placeholder="검색" />
      </div>
    </Example>

    <Example
      title="clearable"
      description={<><Code>clearable</Code>로 값이 있을 때 ✕ 버튼을 노출합니다.</>}
      code={`<TextField clearable value={v} onChange={setV} />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField clearable value={clearWeb} onChange={setClearWeb} label="이름" />
      </div>
    </Example>

    <Example
      title="helperText"
      description={<><Code>helperText</Code>로 보조 설명을 답니다(에러가 있으면 에러가 우선).</>}
      code={`<TextField helperText="공개되지 않습니다" label="이메일" />`}
    >
      <div style={{ width: 320 }}>
        <WebTextField helperText="공개되지 않습니다" label="이메일" placeholder="email@example.com" />
      </div>
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
    <Example
      title="size"
      description={<><Code>size</Code>로 높이를 조절합니다(sm/md/lg).</>}
      code={`<TextField size="sm" label="Small" />\n<TextField size="lg" label="Large" />`}
    >
      <ClientOnly>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
          <RNTextField size="sm" label="Small" placeholder="sm" />
          <RNTextField size="lg" label="Large" placeholder="lg" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="prefix / suffix"
      description={<><Code>prefix</Code>·<Code>suffix</Code>로 입력칸 좌/우에 아이콘 등을 넣습니다.</>}
      code={`<TextField prefix={<Icon name="search" />} placeholder="검색" />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField prefix={<RNIcon name="search" size={18} />} placeholder="검색" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="clearable"
      description={<><Code>clearable</Code>로 값이 있을 때 ✕ 버튼을 노출합니다.</>}
      code={`<TextField clearable value={v} onChangeText={setV} />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField clearable value={clearRn} onChangeText={setClearRn} label="이름" />
        </div>
      </ClientOnly>
    </Example>

    <Example
      title="helperText"
      description={<><Code>helperText</Code>로 보조 설명을 답니다(에러가 있으면 에러가 우선).</>}
      code={`<TextField helperText="공개되지 않습니다" label="이메일" />`}
    >
      <ClientOnly>
        <div style={{ width: 320 }}>
          <RNTextField helperText="공개되지 않습니다" label="이메일" placeholder="email@example.com" />
        </div>
      </ClientOnly>
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
