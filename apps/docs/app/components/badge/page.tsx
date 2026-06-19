"use client";
import { Badge } from "@superbase/react";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function BadgePage() {
  return (
    <ComponentDoc title="Badge" lead="상태나 분류를 작은 라벨로 표시합니다.">
      <Example
        title="variant"
        description={
          <>
            <Code>variant</Code>로 의미별 색을 지정합니다. neutral·brand·success·warning·danger를
            지원합니다.
          </>
        }
        code={`<Badge>Neutral</Badge>\n<Badge variant="brand">Brand</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>\n<Badge variant="danger">Danger</Badge>`}
      >
        <Badge>Neutral</Badge>
        <Badge variant="brand">Brand</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
      </Example>
    </ComponentDoc>
  );
}
