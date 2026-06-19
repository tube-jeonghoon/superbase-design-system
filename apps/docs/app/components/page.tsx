"use client";
import { useState } from "react";
import {
  Text,
  Button,
  TextField,
  Stack,
  Switch,
  Checkbox,
  RadioGroup,
  Radio,
  Badge,
  Spinner,
} from "@superbase/react";

export default function ComponentsPage() {
  const [name, setName] = useState("");
  const [on, setOn] = useState(false);
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState("basic");

  return (
    <Stack direction="column" gap={8}>
      <Text as="h1" variant="display" weight="bold">
        Components
      </Text>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Button
        </Text>
        <Stack direction="row" gap={3} align="center">
          <Button variant="primary" size="sm">Primary SM</Button>
          <Button variant="primary" size="md">Primary MD</Button>
          <Button variant="primary" size="lg">Primary LG</Button>
          <Button variant="secondary" size="md">Secondary</Button>
          <Button variant="primary" size="md" disabled>Disabled</Button>
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Text
        </Text>
        <Stack direction="column" gap={1}>
          <Text variant="display" weight="bold">Display</Text>
          <Text variant="title" weight="bold">Title</Text>
          <Text variant="body">Body</Text>
          <Text variant="caption" color="secondary">Caption secondary</Text>
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          TextField
        </Text>
        <div style={{ maxWidth: 320 }}>
          <TextField
            label="이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={setName}
          />
          <div style={{ height: "var(--spacing-4)" }} />
          <TextField label="이메일" error="필수 입력 항목입니다" placeholder="email@example.com" />
        </div>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Switch
        </Text>
        <Stack direction="row" gap={3} align="center">
          <Switch checked={on} onChange={setOn} aria-label="데모 스위치" />
          <Text variant="body" color="secondary">{on ? "On" : "Off"}</Text>
          <Switch checked disabled aria-label="비활성 스위치" />
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Checkbox
        </Text>
        <Stack direction="column" gap={2}>
          <Checkbox checked={agree} onChange={setAgree} label="약관에 동의합니다" />
          <Checkbox checked disabled label="비활성(선택됨)" />
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Radio
        </Text>
        <RadioGroup value={plan} onChange={setPlan} aria-label="요금제">
          <Radio value="basic" label="Basic" />
          <Radio value="pro" label="Pro" />
          <Radio value="enterprise" label="Enterprise" disabled />
        </RadioGroup>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Badge
        </Text>
        <Stack direction="row" gap={2} align="center">
          <Badge>Neutral</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Spinner
        </Text>
        <Stack direction="row" gap={4} align="center">
          <Spinner size="sm" aria-label="로딩 sm" />
          <Spinner size="md" aria-label="로딩 md" />
          <Spinner size="lg" aria-label="로딩 lg" />
        </Stack>
      </section>
    </Stack>
  );
}
