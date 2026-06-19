import type { ReactNode } from "react";
import { Text } from "@thesuperbase/react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Getting Started" },
  { href: "/foundations", label: "Foundations" },
  { href: "/components", label: "Components" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          borderRight: "1px solid var(--color-border-default)",
          padding: "var(--spacing-6)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Text as="div" variant="title" weight="bold">
          Superbase
        </Text>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-2)",
            marginTop: "var(--spacing-6)",
          }}
        >
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              <Text variant="body" color="secondary">
                {item.label}
              </Text>
            </a>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-4) var(--spacing-8)",
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          <Text variant="caption" color="secondary">
            다크 모드
          </Text>
          <ThemeToggle />
        </header>
        <main style={{ padding: "var(--spacing-8)", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
