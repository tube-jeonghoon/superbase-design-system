"use client";
import { useState } from "react";
import { Text, Button, TextField, Stack, Switch } from "@superbase/react";

export default function ComponentsPage() {
  const [name, setName] = useState("");
  const [on, setOn] = useState(false);

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
    </Stack>
  );
}
