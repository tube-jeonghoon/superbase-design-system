"use client";
import { useState } from "react";
import {
  BottomNavigation as WebBottomNavigation,
  BottomNavigationItem as WebBottomNavigationItem,
  Icon as WebIcon,
} from "@superbase/react";
import {
  BottomNavigation as RNBottomNavigation,
  BottomNavigationItem as RNBottomNavigationItem,
  Icon as RNIcon,
  useTheme as useRNTheme,
} from "@superbase/react-native";
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

// Realistic mobile width so the bar reads like a real bottom nav (centered),
// rather than shrinking to content inside the flex preview canvas.
const barStyle = { width: "100%", maxWidth: 420 } as const;

function WebDemo({ withBack }: { withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const wi = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <WebIcon name={name} color={active ? "var(--color-brand-primary)" : "var(--color-text-secondary)"} />
  );
  return (
    <div style={frame}>
      <WebBottomNavigation value={value} onChange={setValue} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <WebBottomNavigationItem value="home" label="홈" icon={wi("home")} />
        <WebBottomNavigationItem value="calendar" label="일정" icon={wi("calendar")} />
        <WebBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={wi("users")} />
        <WebBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={wi(withBack ? "chat" : "user")} />
      </WebBottomNavigation>
    </div>
  );
}

function RNDemo({ withBack }: { withBack?: boolean }) {
  const [value, setValue] = useState("home");
  const t = useRNTheme();
  const ri = (name: "home" | "calendar" | "users" | "user" | "chat") => (active: boolean) => (
    <RNIcon name={name} color={active ? t.color.brand.primary : t.color.text.secondary} />
  );
  return (
    <div style={frame}>
      <RNBottomNavigation value={value} onChange={setValue} onBack={withBack ? () => {} : undefined} style={barStyle}>
        <RNBottomNavigationItem value="home" label="홈" icon={ri("home")} />
        <RNBottomNavigationItem value="calendar" label="일정" icon={ri("calendar")} />
        <RNBottomNavigationItem value="club" label={withBack ? "멤버" : "클럽"} icon={ri("users")} />
        <RNBottomNavigationItem value="me" label={withBack ? "커뮤니티" : "마이페이지"} icon={ri(withBack ? "chat" : "user")} />
      </RNBottomNavigation>
    </div>
  );
}

const webContent = (
  <>
    <Example
      title="기본"
      description={<><Code>value</Code>/<Code>onChange</Code>로 제어합니다. <Code>icon</Code>은 <Code>(active) =&gt; ReactNode</Code> 렌더 함수입니다. 활성 항목은 브랜드 색으로 강조됩니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? brand : secondary} />} />
  …
</BottomNavigation>`}
    >
      <WebDemo />
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>을 주면 좌측에 뒤로가기 버튼이 생깁니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <WebDemo withBack />
    </Example>
  </>
);

const nativeContent = (
  <>
    <Example
      title="기본"
      description={<>RN도 동일 API. <Code>icon</Code>의 색은 <Code>useTheme()</Code>로 가져옵니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue}>
  <BottomNavigationItem value="home" label="홈"
    icon={(active) => <Icon name="home" color={active ? t.color.brand.primary : t.color.text.secondary} />} />
  …
</BottomNavigation>`}
    >
      <ClientOnly><RNDemo /></ClientOnly>
    </Example>
    <Example
      title="중첩(뒤로가기)"
      description={<><Code>onBack</Code>으로 뒤로가기 버튼을 표시합니다.</>}
      code={`<BottomNavigation value={value} onChange={setValue} onBack={goBack}>…</BottomNavigation>`}
    >
      <ClientOnly><RNDemo withBack /></ClientOnly>
    </Example>
  </>
);

export default function BottomNavigationPage() {
  return (
    <ComponentDoc title="BottomNavigation" lead="화면 하단의 floating 네비게이션 바. 기본형과 뒤로가기 중첩형을 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
