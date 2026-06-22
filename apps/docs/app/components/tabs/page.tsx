"use client";
import { useState } from "react";
import {
  Tabs as WebTabs,
  TabList as WebTabList,
  Tab as WebTab,
  TabPanel as WebTabPanel,
  Text as WebText,
} from "@superbase/react";
import {
  Tabs as RNTabs,
  TabList as RNTabList,
  Tab as RNTab,
  TabPanel as RNTabPanel,
  Text as RNText,
} from "@superbase/react-native";
import { ComponentDoc } from "../../../components/docs/ComponentDoc";
import { Tabs as DocTabs } from "../../../components/docs/Tabs";
import { Example } from "../../../components/docs/Example";
import { Code } from "../../../components/docs/Code";
import { ClientOnly } from "../../../components/docs/ClientOnly";

function WebDemo() {
  const [value, setValue] = useState("overview");
  return (
    <WebTabs value={value} onChange={setValue}>
      <WebTabList aria-label="섹션">
        <WebTab value="overview">개요</WebTab>
        <WebTab value="specs">사양</WebTab>
        <WebTab value="reviews">리뷰</WebTab>
      </WebTabList>
      <WebTabPanel value="overview"><WebText>개요 패널</WebText></WebTabPanel>
      <WebTabPanel value="specs"><WebText>사양 패널</WebText></WebTabPanel>
      <WebTabPanel value="reviews"><WebText>리뷰 패널</WebText></WebTabPanel>
    </WebTabs>
  );
}

function RNDemo() {
  const [value, setValue] = useState("overview");
  return (
    <RNTabs value={value} onChange={setValue}>
      <RNTabList aria-label="섹션">
        <RNTab value="overview">개요</RNTab>
        <RNTab value="specs">사양</RNTab>
        <RNTab value="reviews">리뷰</RNTab>
      </RNTabList>
      <RNTabPanel value="overview"><RNText>개요 패널</RNText></RNTabPanel>
      <RNTabPanel value="specs"><RNText>사양 패널</RNText></RNTabPanel>
      <RNTabPanel value="reviews"><RNText>리뷰 패널</RNText></RNTabPanel>
    </RNTabs>
  );
}

const webContent = (
  <Example
    title="기본 사용"
    description={<><Code>Tabs/TabList/Tab/TabPanel</Code> 컴파운드로 구성합니다. 웹은 ←/→ 키로 탭을 이동할 수 있습니다.</>}
    code={`<Tabs value={value} onChange={setValue}>\n  <TabList aria-label="섹션">\n    <Tab value="overview">개요</Tab>\n    <Tab value="specs">사양</Tab>\n  </TabList>\n  <TabPanel value="overview">…</TabPanel>\n  <TabPanel value="specs">…</TabPanel>\n</Tabs>`}
  >
    <WebDemo />
  </Example>
);

const nativeContent = (
  <Example
    title="기본 사용"
    description={<><Code>Tabs/TabList/Tab/TabPanel</Code> 컴파운드로 구성합니다.</>}
    code={`<Tabs value={value} onChange={setValue}>\n  <TabList>\n    <Tab value="overview">개요</Tab>\n    <Tab value="specs">사양</Tab>\n  </TabList>\n  <TabPanel value="overview">…</TabPanel>\n</Tabs>`}
  >
    <ClientOnly>
      <RNDemo />
    </ClientOnly>
  </Example>
);

export default function TabsPage() {
  return (
    <ComponentDoc title="Tabs" lead="콘텐츠를 탭으로 나눠 보여줍니다. 키보드 내비와 ARIA를 지원합니다.">
      <DocTabs ariaLabel="플랫폼" items={[
        { id: "web", label: "Web", content: webContent },
        { id: "native", label: "React Native", content: nativeContent },
      ]} />
    </ComponentDoc>
  );
}
