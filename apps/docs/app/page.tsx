import { Text, Stack, Button } from "@superbase/react";

export default function HomePage() {
  return (
    <Stack direction="column" gap={6}>
      <Text as="h1" variant="display" weight="bold">
        Superbase Design System
      </Text>
      <Text variant="body" color="secondary">
        토큰과 컴포넌트를 웹·모바일에서 일관되게 사용하기 위한 디자인 시스템입니다.
      </Text>

      <section>
        <Text as="h2" variant="title" weight="bold">
          설치
        </Text>
        <pre
          style={{
            background: "var(--color-background-subtle)",
            padding: "var(--spacing-4)",
            borderRadius: "var(--radius-md)",
            overflowX: "auto",
          }}
        >
{`import "@superbase/tokens/css";
import "@superbase/react/styles.css";
import { Button, Text } from "@superbase/react";`}
        </pre>
      </section>

      <Stack direction="row" gap={3}>
        <a href="/foundations">
          <Button variant="primary" size="md">Foundations 보기</Button>
        </a>
        <a href="/components">
          <Button variant="secondary" size="md">Components 보기</Button>
        </a>
      </Stack>
    </Stack>
  );
}
