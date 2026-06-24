"use client";
import {
  Header as WebHeader,
  HeaderBrand as WebHeaderBrand,
  HeaderTitle as WebHeaderTitle,
  HeaderActions as WebHeaderActions,
  HeaderAction as WebHeaderAction,
  Icon as WebIcon,
} from "@superbase/react";
import {
  Header as RNHeader,
  HeaderBrand as RNHeaderBrand,
  HeaderTitle as RNHeaderTitle,
  HeaderActions as RNHeaderActions,
  HeaderAction as RNHeaderAction,
  Icon as RNIcon,
  useTheme as useRNTheme,
} from "@superbase/react-native";
import { View } from "react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const frame: React.CSSProperties = {
  background: "var(--color-background-subtle)",
  padding: "var(--spacing-6) var(--spacing-4)",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};
const barStyle = { width: "100%", maxWidth: 420 } as const;

function WebBrand() {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        background: "var(--color-brand-primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <WebIcon name="star" color="#fff" />
    </span>
  );
}

function WebDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  return (
    <div style={frame}>
      <WebHeader variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <WebHeaderBrand><WebBrand /></WebHeaderBrand>
        <WebHeaderTitle title="오늘의대회" subtitle="Smash today" />
        <WebHeaderActions>
          <WebHeaderAction icon={<WebIcon name="bell" />} label="알림" badge />
          <WebHeaderAction icon={<WebIcon name="settings" />} label="설정" />
        </WebHeaderActions>
      </WebHeader>
    </div>
  );
}

function RNBrand() {
  const t = useRNTheme();
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        backgroundColor: t.color.brand.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RNIcon name="star" color="#fff" />
    </View>
  );
}

function RNDemo({ variant, withBack }: { variant?: "bar" | "floating"; withBack?: boolean }) {
  return (
    <div style={frame}>
      <RNHeader variant={variant} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <RNHeaderBrand><RNBrand /></RNHeaderBrand>
        <RNHeaderTitle title="오늘의대회" subtitle="Smash today" />
        <RNHeaderActions>
          <RNHeaderAction icon={<RNIcon name="bell" />} label="알림" badge />
          <RNHeaderAction icon={<RNIcon name="settings" />} label="설정" />
        </RNHeaderActions>
      </RNHeader>
    </div>
  );
}

const webContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<><Code>variant</Code> 기본값은 <Code>"bar"</Code>로, 화면 폭을 꽉 채우고 하단 보더가 있는 표준 헤더입니다. 우측 <Code>HeaderAction</Code>의 <Code>badge</Code>로 빨간 알림 점을 표시합니다.</>}
      code={`<Header>
  <HeaderBrand>{/* 로고/아바타 */}</HeaderBrand>
  <HeaderTitle title="오늘의대회" subtitle="Smash today" />
  <HeaderActions>
    <HeaderAction icon={<Icon name="bell" />} label="알림" badge />
    <HeaderAction icon={<Icon name="settings" />} label="설정" />
  </HeaderActions>
</Header>`}
    >
      <WebDemo />
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>은 라운드 + 보더 + 은은한 그림자로 카드처럼 띄웁니다.</>}
      code={`<Header variant="floating">…</Header>`}
    >
      <WebDemo variant="floating" />
    </Example>
    <Example
      title="뒤로가기"
      description={<><Code>onBack</Code>을 주면 좌측에 뒤로가기 버튼이 생깁니다.</>}
      code={`<Header onBack={goBack}>…</Header>`}
    >
      <WebDemo withBack />
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본 (bar)"
      description={<>RN도 동일 API. <Code>icon</Code> 색은 <Code>useTheme()</Code>로 가져옵니다.</>}
      code={`<Header>
  <HeaderBrand>{/* 로고/아바타 */}</HeaderBrand>
  <HeaderTitle title="오늘의대회" subtitle="Smash today" />
  <HeaderActions>
    <HeaderAction icon={<Icon name="bell" />} label="알림" badge />
    <HeaderAction icon={<Icon name="settings" />} label="설정" />
  </HeaderActions>
</Header>`}
    >
      <ClientOnly><RNDemo /></ClientOnly>
    </Example>
    <Example
      title="플로팅 (floating)"
      description={<><Code>variant="floating"</Code>으로 카드형 헤더를 만듭니다.</>}
      code={`<Header variant="floating">…</Header>`}
    >
      <ClientOnly><RNDemo variant="floating" /></ClientOnly>
    </Example>
    <Example
      title="뒤로가기"
      description={<><Code>onBack</Code>으로 뒤로가기 버튼을 표시합니다.</>}
      code={`<Header onBack={goBack}>…</Header>`}
    >
      <ClientOnly><RNDemo withBack /></ClientOnly>
    </Example>
  </>
);

export default function HeaderPage() {
  return (
    <ComponentDoc title="Header" lead="앱 상단 헤더. 브랜드/타이틀/액션을 조합하며 bar·floating 두 룩과 뒤로가기를 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
