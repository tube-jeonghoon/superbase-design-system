"use client";
import { Button as WebButton } from "@superbase/react";
import { Button as RNButton } from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const webContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>variant</Code>로 스타일을 정합니다. <Code>primary</Code>는 주요
          액션, <Code>secondary</Code>는 보조 액션에 씁니다.
        </>
      }
      code={`<Button variant="primary">확인</Button>\n<Button variant="secondary">취소</Button>`}
    >
      <WebButton variant="primary">확인</WebButton>
      <WebButton variant="secondary">취소</WebButton>
    </Example>

    <Example
      title="크기 조정하기"
      description={
        <>
          <Code>size</Code>로 크기를 바꿉니다. <Code>sm</Code>, <Code>md</Code>,{" "}
          <Code>lg</Code> 중 하나를 고를 수 있어요.
        </>
      }
      code={`<Button size="sm">Small</Button>\n<Button size="md">Medium</Button>\n<Button size="lg">Large</Button>`}
    >
      <WebButton size="sm">Small</WebButton>
      <WebButton size="md">Medium</WebButton>
      <WebButton size="lg">Large</WebButton>
    </Example>

    <Example
      title="비활성"
      description={<><Code>disabled</Code>로 버튼을 비활성화합니다.</>}
      code={`<Button disabled>비활성</Button>`}
    >
      <WebButton disabled>비활성</WebButton>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>variant</Code>로 스타일을, <Code>onPress</Code>로 액션을 정합니다.
        </>
      }
      code={`<Button variant="primary" onPress={onConfirm}>확인</Button>\n<Button variant="secondary" onPress={onCancel}>취소</Button>`}
    >
      <ClientOnly>
        <RNButton variant="primary" onPress={() => {}}>확인</RNButton>
        <RNButton variant="secondary" onPress={() => {}}>취소</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="크기 조정하기"
      description={
        <>
          <Code>size</Code>로 크기를 바꿉니다. <Code>sm</Code>, <Code>md</Code>,{" "}
          <Code>lg</Code> 중 하나를 고를 수 있어요.
        </>
      }
      code={`<Button size="sm" onPress={fn}>Small</Button>\n<Button size="md" onPress={fn}>Medium</Button>\n<Button size="lg" onPress={fn}>Large</Button>`}
    >
      <ClientOnly>
        <RNButton size="sm" onPress={() => {}}>Small</RNButton>
        <RNButton size="md" onPress={() => {}}>Medium</RNButton>
        <RNButton size="lg" onPress={() => {}}>Large</RNButton>
      </ClientOnly>
    </Example>

    <Example
      title="비활성"
      description={<><Code>disabled</Code>로 버튼을 비활성화합니다.</>}
      code={`<Button disabled onPress={fn}>비활성</Button>`}
    >
      <ClientOnly>
        <RNButton disabled onPress={() => {}}>비활성</RNButton>
      </ClientOnly>
    </Example>
  </>
);

export default function ButtonPage() {
  return (
    <ComponentDoc
      title="Button"
      lead="사용자의 액션을 유도하는 기본 버튼. variant·size·disabled를 지원합니다."
    >
      <Tabs
        ariaLabel="플랫폼"
        items={[
          { id: "web", label: "Web", content: webContent },
          { id: "native", label: "React Native", content: nativeContent },
        ]}
      />
    </ComponentDoc>
  );
}
