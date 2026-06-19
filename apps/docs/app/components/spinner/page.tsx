"use client";
import { Spinner } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function SpinnerPage() {
  return (
    <ComponentDoc title="Spinner" lead="로딩 중임을 나타내는 회전 인디케이터입니다.">
      <Example
        title="크기"
        description={
          <>
            <Code>size</Code>로 크기를 정합니다. <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code>를
            지원합니다.
          </>
        }
        code={`<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`}
      >
        <Spinner size="sm" aria-label="로딩 sm" />
        <Spinner size="md" aria-label="로딩 md" />
        <Spinner size="lg" aria-label="로딩 lg" />
      </Example>
    </ComponentDoc>
  );
}
