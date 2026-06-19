"use client";
import { Button } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function ButtonPage() {
  return (
    <ComponentDoc
      title="Button"
      lead="사용자의 액션을 유도하는 기본 버튼. variant·size·disabled를 지원합니다."
    >
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
        <Button variant="primary">확인</Button>
        <Button variant="secondary">취소</Button>
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
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </Example>

      <Example
        title="비활성"
        description={
          <>
            <Code>disabled</Code>로 버튼을 비활성화합니다.
          </>
        }
        code={`<Button disabled>비활성</Button>`}
      >
        <Button disabled>비활성</Button>
      </Example>
    </ComponentDoc>
  );
}
