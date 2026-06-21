"use client";
import { Badge as WebBadge, Icon as WebIcon } from "@superbase/react";
import { Badge as RNBadge, Icon as RNIcon } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const desc = (
  <>
    <Code>variant</Code>로 의미별 색을 지정합니다. neutral·brand·success·warning·danger를 지원합니다.
  </>
);
const code = `<Badge>Neutral</Badge>\n<Badge variant="brand">Brand</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>\n<Badge variant="danger">Danger</Badge>`;

const webContent = (
  <>
    <Example title="variant" description={desc} code={code}>
      <WebBadge>Neutral</WebBadge>
      <WebBadge variant="brand">Brand</WebBadge>
      <WebBadge variant="success">Success</WebBadge>
      <WebBadge variant="warning">Warning</WebBadge>
      <WebBadge variant="danger">Danger</WebBadge>
    </Example>
    <Example
      title="size · dot · icon"
      description={<><Code>size</Code>(sm/md)·<Code>dot</Code>·<Code>icon</Code>을 지원합니다.</>}
      code={`<Badge size="sm">SM</Badge>\n<Badge dot variant="success">Online</Badge>\n<Badge icon={<Icon name="star" size="xs" />}>Featured</Badge>`}
    >
      <WebBadge size="sm">SM</WebBadge>
      <WebBadge dot variant="success">Online</WebBadge>
      <WebBadge icon={<WebIcon name="star" size="xs" />}>Featured</WebBadge>
    </Example>
  </>
);
const nativeContent = (
  <>
    <Example title="variant" description={desc} code={code}>
      <ClientOnly>
        <RNBadge>Neutral</RNBadge>
        <RNBadge variant="brand">Brand</RNBadge>
        <RNBadge variant="success">Success</RNBadge>
        <RNBadge variant="warning">Warning</RNBadge>
        <RNBadge variant="danger">Danger</RNBadge>
      </ClientOnly>
    </Example>
    <Example
      title="size · dot · icon"
      description={<><Code>size</Code>(sm/md)·<Code>dot</Code>·<Code>icon</Code>을 지원합니다.</>}
      code={`<Badge size="sm">SM</Badge>\n<Badge dot variant="success">Online</Badge>\n<Badge icon={<Icon name="star" size="xs" />}>Featured</Badge>`}
    >
      <ClientOnly>
        <RNBadge size="sm">SM</RNBadge>
        <RNBadge dot variant="success">Online</RNBadge>
        <RNBadge icon={<RNIcon name="star" size="xs" color="#ffffff" />}>Featured</RNBadge>
      </ClientOnly>
    </Example>
  </>
);

export default function BadgePage() {
  return (
    <ComponentDoc title="Badge" lead="상태나 분류를 작은 라벨로 표시합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
