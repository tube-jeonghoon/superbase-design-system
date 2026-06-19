import { Text, Stack } from "@thesuperbase/react";
import { Swatch } from "../../components/Swatch";
import { semanticColors, spacingScale, fontSizes, radii } from "../../lib/tokens";

export default function FoundationsPage() {
  return (
    <Stack direction="column" gap={8}>
      <Text as="h1" variant="display" weight="bold">
        Foundations
      </Text>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Colors
        </Text>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--spacing-4)",
            marginTop: "var(--spacing-4)",
          }}
        >
          {semanticColors.map((token) => (
            <Swatch key={token.cssVar} name={token.name} cssVar={token.cssVar} />
          ))}
        </div>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Typography
        </Text>
        <Stack direction="column" gap={2}>
          {fontSizes.map((f) => (
            <Text key={f.cssVar} variant="body">
              <span style={{ fontSize: `var(${f.cssVar})` }}>{f.name}</span> — {f.cssVar}
            </Text>
          ))}
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Spacing
        </Text>
        <Stack direction="column" gap={2}>
          {spacingScale.map((n) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
              <div
                style={{
                  height: 16,
                  width: n === 0 ? "1px" : `var(--spacing-${n})`,
                  background: "var(--color-brand-primary)",
                }}
              />
              <Text variant="caption" color="secondary">
                spacing-{n}
              </Text>
            </div>
          ))}
        </Stack>
      </section>

      <section>
        <Text as="h2" variant="title" weight="bold">
          Radius
        </Text>
        <div style={{ display: "flex", gap: "var(--spacing-4)", marginTop: "var(--spacing-4)" }}>
          {radii.map((r) => (
            <div key={r.cssVar} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)", alignItems: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "var(--color-background-subtle)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: `var(${r.cssVar})`,
                }}
              />
              <Text variant="caption" color="secondary">
                {r.name}
              </Text>
            </div>
          ))}
        </div>
      </section>
    </Stack>
  );
}
