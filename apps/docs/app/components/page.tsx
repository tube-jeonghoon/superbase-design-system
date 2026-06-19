import { Text } from "@superbase/react";
import { componentNav } from "../../components/docs/componentNav";

export default function ComponentsIndexPage() {
  return (
    <div>
      <Text as="h1" variant="display" weight="bold">
        Components
      </Text>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "var(--spacing-4)",
          marginTop: "var(--spacing-6)",
        }}
      >
        {componentNav.map((c) => (
          <a
            key={c.slug}
            href={`/components/${c.slug}`}
            style={{
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-4)",
              display: "block",
            }}
          >
            <Text variant="title" weight="bold">
              {c.label}
            </Text>
          </a>
        ))}
      </div>
    </div>
  );
}
