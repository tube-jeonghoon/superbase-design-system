"use client";
import { Icon } from "@superbase/react";
import { iconNames } from "@superbase/icons";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";

export default function IconPage() {
  return (
    <ComponentDoc title="Icon" lead="자체 큐레이션한 라인 아이콘 세트. name으로 선택합니다.">
      <Example
        title="기본 사용"
        description={
          <>
            <Code>name</Code>으로 아이콘을, <Code>size</Code>·<Code>color</Code>로 크기와 색을
            정합니다. 기본 색은 텍스트 색을 따릅니다.
          </>
        }
        code={`<Icon name="search" />\n<Icon name="check" size={24} color="var(--color-brand-primary)" />`}
      >
        <Icon name="search" />
        <Icon name="check" size={24} color="var(--color-brand-primary)" />
      </Example>

      <Example
        title="전체 아이콘"
        description="현재 제공하는 모든 아이콘입니다."
        code={`import { iconNames } from "@superbase/icons";\niconNames.map((name) => <Icon name={name} />)`}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "var(--spacing-4)",
            width: "100%",
          }}
        >
          {iconNames.map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-1)",
              }}
            >
              <Icon name={n} size={24} />
              <span style={{ fontSize: "var(--font-size-caption)", color: "var(--color-text-secondary)" }}>
                {n}
              </span>
            </div>
          ))}
        </div>
      </Example>
    </ComponentDoc>
  );
}
