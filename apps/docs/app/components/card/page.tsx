"use client";
import { Card as WebCard, Text as WebText } from "@superbase/react";
import { Card as RNCard, Text as RNText } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-4)", flexWrap: "wrap" };

const webContent = (
  <>
    <Example
      title="elevation"
      description={<><Code>elevation</Code>(none/sm/md/lg)으로 그림자 깊이를 정합니다.</>}
      code={`<Card elevation="sm">…</Card>\n<Card elevation="md">…</Card>\n<Card elevation="lg">…</Card>`}
    >
      <div style={row}>
        <WebCard elevation="sm"><WebText weight="medium">sm</WebText></WebCard>
        <WebCard elevation="md"><WebText weight="medium">md</WebText></WebCard>
        <WebCard elevation="lg"><WebText weight="medium">lg</WebText></WebCard>
      </div>
    </Example>
    <Example
      title="bordered · padding"
      description={<><Code>bordered</Code>로 보더, <Code>padding</Code>으로 안쪽 여백을 정합니다.</>}
      code={`<Card bordered elevation="none" padding={6}>…</Card>`}
    >
      <WebCard bordered elevation="none" padding={6}>
        <WebText weight="bold">제목</WebText>
        <WebText color="secondary">보더 + 큰 패딩 카드</WebText>
      </WebCard>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="elevation"
      description={<><Code>elevation</Code>(none/sm/md/lg)으로 그림자 깊이를 정합니다.</>}
      code={`<Card elevation="md">…</Card>`}
    >
      <ClientOnly>
        <div style={row}>
          <RNCard elevation="sm"><RNText weight="medium">sm</RNText></RNCard>
          <RNCard elevation="md"><RNText weight="medium">md</RNText></RNCard>
          <RNCard elevation="lg"><RNText weight="medium">lg</RNText></RNCard>
        </div>
      </ClientOnly>
    </Example>
    <Example
      title="bordered · padding"
      description={<><Code>bordered</Code>로 보더, <Code>padding</Code>으로 안쪽 여백을 정합니다.</>}
      code={`<Card bordered elevation="none" padding={6}>…</Card>`}
    >
      <ClientOnly>
        <RNCard bordered elevation="none" padding={6}>
          <RNText weight="bold">제목</RNText>
          <RNText color="secondary">보더 + 큰 패딩 카드</RNText>
        </RNCard>
      </ClientOnly>
    </Example>
  </>
);

export default function CardPage() {
  return (
    <ComponentDoc title="Card" lead="콘텐츠를 담는 컨테이너. 그림자·보더·패딩을 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
