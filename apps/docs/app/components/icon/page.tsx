"use client";
import { Icon as WebIcon } from "@superbase/react";
import { Icon as RNIcon } from "@superbase/react-native";
import { iconNames } from "@superbase/icons";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "var(--spacing-4)",
  width: "100%",
};
const cell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "var(--spacing-1)",
};
const cellLabel: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

const webContent = (
  <>
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
      <WebIcon name="search" />
      <WebIcon name="check" size={24} color="var(--color-brand-primary)" />
    </Example>

    <Example title="전체 아이콘" description="현재 제공하는 모든 아이콘입니다." code={`iconNames.map((name) => <Icon name={name} />)`}>
      <div style={gridStyle}>
        {iconNames.map((n) => (
          <div key={n} style={cell}>
            <WebIcon name={n} size={24} />
            <span style={cellLabel}>{n}</span>
          </div>
        ))}
      </div>
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 사용"
      description={
        <>
          <Code>name</Code>으로 아이콘을, <Code>size</Code>·<Code>color</Code>로 크기와 색을
          정합니다. RN은 기본 색이 토큰 텍스트 색입니다.
        </>
      }
      code={`<Icon name="search" />\n<Icon name="check" size={24} color="#3182f6" />`}
    >
      <ClientOnly>
        <RNIcon name="search" />
        <RNIcon name="check" size={24} color="#3182f6" />
      </ClientOnly>
    </Example>

    <Example title="전체 아이콘" description="현재 제공하는 모든 아이콘입니다." code={`iconNames.map((name) => <Icon name={name} />)`}>
      <ClientOnly>
        <div style={gridStyle}>
          {iconNames.map((n) => (
            <div key={n} style={cell}>
              <RNIcon name={n} size={24} />
              <span style={cellLabel}>{n}</span>
            </div>
          ))}
        </div>
      </ClientOnly>
    </Example>
  </>
);

export default function IconPage() {
  return (
    <ComponentDoc title="Icon" lead="자체 큐레이션한 라인 아이콘 세트. name으로 선택합니다.">
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
