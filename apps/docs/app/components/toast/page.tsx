"use client";
import {
  ToastProvider as WebToastProvider,
  useToast as useWebToast,
  Button as WebButton,
} from "@superbase/react";
import {
  ToastProvider as RNToastProvider,
  useToast as useRNToast,
  Button as RNButton,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

const row: React.CSSProperties = { display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" };

function WebDemo() {
  const toast = useWebToast();
  return (
    <div style={row}>
      <WebButton onClick={() => toast.show({ title: "저장되었습니다" })}>기본</WebButton>
      <WebButton variant="outline" onClick={() => toast.success("업로드 완료")}>success</WebButton>
      <WebButton variant="outline" onClick={() => toast.error("업로드 실패", { description: "다시 시도해 주세요." })}>error</WebButton>
      <WebButton variant="ghost" onClick={() => toast.info("새 메시지", { action: { label: "보기", onClick: () => {} } })}>action</WebButton>
    </div>
  );
}

function RNDemo() {
  const toast = useRNToast();
  return (
    <div style={row}>
      <RNButton onPress={() => toast.show({ title: "저장되었습니다" })}>기본</RNButton>
      <RNButton variant="outline" onPress={() => toast.success("업로드 완료")}>success</RNButton>
      <RNButton variant="outline" onPress={() => toast.error("업로드 실패", { description: "다시 시도해 주세요." })}>error</RNButton>
    </div>
  );
}

const webContent = (
  <Example
    title="기본 사용"
    description={<><Code>useToast()</Code>의 <Code>show</Code>/<Code>success</Code>/<Code>error</Code>로 토스트를 띄웁니다. 4초 후 자동으로 사라지며 하단 중앙에 쌓입니다. 앱 루트를 <Code>ToastProvider</Code>로 감싸세요.</>}
    code={`const toast = useToast();
toast.show({ title: "저장되었습니다" });
toast.success("업로드 완료");
toast.error("업로드 실패", { description: "다시 시도해 주세요." });`}
  >
    <WebToastProvider>
      <WebDemo />
    </WebToastProvider>
  </Example>
);

const nativeContent = (
  <Example
    title="기본 사용"
    description={<>RN은 <Code>ToastProvider</Code>를 앱 루트 근처에 두고(절대배치로 콘텐츠 위에 표시), <Code>action</Code>은 <Code>onPress</Code>를 받습니다.</>}
    code={`const toast = useToast();
toast.show({ title: "저장되었습니다" });
toast.success("업로드 완료");`}
  >
    <ClientOnly>
      <RNToastProvider>
        <RNDemo />
      </RNToastProvider>
    </ClientOnly>
  </Example>
);

export default function ToastPage() {
  return (
    <ComponentDoc title="Toast" lead="잠깐 떴다 사라지는 알림. 명령형 useToast() API로 띄웁니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
