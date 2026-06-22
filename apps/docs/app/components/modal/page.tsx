"use client";
import { useState } from "react";
import {
  Modal as WebModal,
  ModalHeader as WebModalHeader,
  ModalBody as WebModalBody,
  ModalFooter as WebModalFooter,
  Button as WebButton,
  Text as WebText,
} from "@superbase/react";
import {
  Modal as RNModal,
  ModalHeader as RNModalHeader,
  ModalBody as RNModalBody,
  ModalFooter as RNModalFooter,
  Button as RNButton,
  Text as RNText,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

function WebDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <WebButton onClick={() => setOpen(true)}>모달 열기</WebButton>
      <WebModal open={open} onClose={() => setOpen(false)} size="md">
        <WebModalHeader>약관 동의</WebModalHeader>
        <WebModalBody>
          <WebText color="secondary">계속하려면 약관에 동의해 주세요.</WebText>
        </WebModalBody>
        <WebModalFooter>
          <WebButton variant="ghost" onClick={() => setOpen(false)}>취소</WebButton>
          <WebButton onClick={() => setOpen(false)}>동의</WebButton>
        </WebModalFooter>
      </WebModal>
    </>
  );
}

function RNDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RNButton onPress={() => setOpen(true)}>모달 열기</RNButton>
      <RNModal open={open} onClose={() => setOpen(false)} size="md">
        <RNModalHeader>약관 동의</RNModalHeader>
        <RNModalBody>
          <RNText color="secondary">계속하려면 약관에 동의해 주세요.</RNText>
        </RNModalBody>
        <RNModalFooter>
          <RNButton variant="ghost" onPress={() => setOpen(false)}>취소</RNButton>
          <RNButton onPress={() => setOpen(false)}>동의</RNButton>
        </RNModalFooter>
      </RNModal>
    </>
  );
}

const webContent = (
  <Example
    title="기본 사용"
    description={<><Code>open</Code>/<Code>onClose</Code>로 제어하고 <Code>ModalHeader</Code>/<Code>ModalBody</Code>/<Code>ModalFooter</Code>로 구성합니다. Escape·백드롭 클릭으로 닫힙니다.</>}
    code={`<Modal open={open} onClose={close} size="md">
  <ModalHeader>약관 동의</ModalHeader>
  <ModalBody>계속하려면 약관에 동의해 주세요.</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={close}>취소</Button>
    <Button onClick={close}>동의</Button>
  </ModalFooter>
</Modal>`}
  >
    <WebDemo />
  </Example>
);

const nativeContent = (
  <Example
    title="기본 사용"
    description={<>RN은 네이티브 <Code>Modal</Code>을 래핑합니다. Android 백버튼으로도 닫힙니다.</>}
    code={`<Modal open={open} onClose={close} size="md">
  <ModalHeader>약관 동의</ModalHeader>
  <ModalBody>계속하려면 약관에 동의해 주세요.</ModalBody>
  <ModalFooter>
    <Button variant="ghost" onPress={close}>취소</Button>
    <Button onPress={close}>동의</Button>
  </ModalFooter>
</Modal>`}
  >
    <ClientOnly>
      <RNDemo />
    </ClientOnly>
  </Example>
);

export default function ModalPage() {
  return (
    <ComponentDoc title="Modal" lead="화면 위에 띄우는 대화상자. 포커스 트랩·스크롤 락·Escape/백드롭 닫기를 지원합니다.">
      <Tabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
