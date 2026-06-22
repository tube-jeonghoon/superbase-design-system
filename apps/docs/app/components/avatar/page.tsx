"use client";
import { Avatar as WebAvatar } from "@superbase/react";
import { Avatar as RNAvatar } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-3)", alignItems: "center" };

const webContent = (
  <>
    <Example
      title="이미지 · 폴백"
      description={<><Code>src</Code>가 있으면 이미지, 없거나 실패하면 <Code>name</Code> 이니셜, name도 없으면 아이콘으로 폴백합니다.</>}
      code={`<Avatar src="/u.png" name="Jeong Hoon" />\n<Avatar name="Jeong Hoon" />\n<Avatar />`}
    >
      <div style={row}>
        <WebAvatar name="Jeong Hoon" />
        <WebAvatar name="Soo" />
        <WebAvatar />
      </div>
    </Example>
    <Example
      title="size · shape"
      description={<><Code>size</Code>(sm/md/lg)·<Code>shape</Code>(circle/square)를 지원합니다.</>}
      code={`<Avatar name="A" size="lg" />\n<Avatar name="A" shape="square" />`}
    >
      <div style={row}>
        <WebAvatar name="SM" size="sm" />
        <WebAvatar name="MD" size="md" />
        <WebAvatar name="LG" size="lg" />
        <WebAvatar name="SQ" shape="square" />
      </div>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="이미지 · 폴백"
      description={<><Code>src</Code>가 있으면 이미지, 없거나 실패하면 <Code>name</Code> 이니셜, name도 없으면 아이콘으로 폴백합니다.</>}
      code={`<Avatar name="Jeong Hoon" />\n<Avatar />`}
    >
      <ClientOnly>
        <div style={row}>
          <RNAvatar name="Jeong Hoon" />
          <RNAvatar name="Soo" />
          <RNAvatar />
        </div>
      </ClientOnly>
    </Example>
    <Example
      title="size · shape"
      description={<><Code>size</Code>(sm/md/lg)·<Code>shape</Code>(circle/square)를 지원합니다.</>}
      code={`<Avatar name="A" size="lg" />\n<Avatar name="A" shape="square" />`}
    >
      <ClientOnly>
        <div style={row}>
          <RNAvatar name="SM" size="sm" />
          <RNAvatar name="MD" size="md" />
          <RNAvatar name="LG" size="lg" />
          <RNAvatar name="SQ" shape="square" />
        </div>
      </ClientOnly>
    </Example>
  </>
);

export default function AvatarPage() {
  return (
    <ComponentDoc title="Avatar" lead="사용자 이미지. 실패 시 이니셜·아이콘으로 폴백합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
