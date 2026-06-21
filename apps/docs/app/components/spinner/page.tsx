"use client";
import { Spinner as WebSpinner } from "@superbase/react";
import { Spinner as RNSpinner } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const desc = (
  <>
    <Code>size</Code>로 크기를 정합니다. <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>를 지원합니다.
  </>
);

const webContent = (
  <Example title="크기" description={desc} code={`<Spinner size="sm" aria-label="로딩 중" />\n<Spinner size="md" aria-label="로딩 중" />\n<Spinner size="lg" aria-label="로딩 중" />`}>
    <WebSpinner size="sm" aria-label="로딩 sm" />
    <WebSpinner size="md" aria-label="로딩 md" />
    <WebSpinner size="lg" aria-label="로딩 lg" />
  </Example>
);
const nativeContent = (
  <Example title="크기" description={desc} code={`<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`}>
    <ClientOnly>
      <RNSpinner size="sm" />
      <RNSpinner size="md" />
      <RNSpinner size="lg" />
    </ClientOnly>
  </Example>
);

export default function SpinnerPage() {
  return (
    <ComponentDoc title="Spinner" lead="로딩 중임을 나타내는 회전 인디케이터입니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
