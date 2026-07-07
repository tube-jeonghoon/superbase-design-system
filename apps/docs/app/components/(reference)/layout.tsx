import type { ReactNode } from "react";
import { catalog, categoryOrder } from "../../../lib/catalog";

export default function ReferenceLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "var(--spacing-8)", alignItems: "start" }}>
      <aside style={{ position: "sticky", top: 80 }}>
        {categoryOrder.map((cat) => {
          const items = catalog.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: "var(--spacing-4)" }}>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-secondary)", textTransform: "uppercase", marginBottom: "var(--spacing-2)" }}>{cat}</div>
              {items.map((c) => (
                <a key={c.slug} href={`/components/${c.slug}`} style={{ display: "block", padding: "6px 0", fontSize: "var(--font-size-caption)", color: "var(--color-text-primary)" }}>{c.name}</a>
              ))}
            </div>
          );
        })}
      </aside>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
