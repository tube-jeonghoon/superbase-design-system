import { Text } from "@superbase/react";

export function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      <div
        style={{
          width: "100%",
          height: 56,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border-default)",
          background: `var(${cssVar})`,
        }}
      />
      <Text variant="caption" weight="medium">
        {name}
      </Text>
      <Text variant="caption" color="secondary">
        {cssVar}
      </Text>
    </div>
  );
}
