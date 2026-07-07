"use client";
import { useMemo, useState } from "react";
import { catalog, categoryOrder, type Category } from "../../lib/catalog";

const STATUS_LABEL: Record<string, string> = { stable: "STABLE", updated: "UPDATED", new: "NEW" };
const STATUS_STYLE: Record<string, React.CSSProperties> = {
  stable: { background: "var(--color-green-100, #d3f0e2)", color: "var(--color-green-700, #146d4b)" },
  updated: { background: "var(--color-amber-100, #f5eccf)", color: "var(--color-amber-700, #7a5b16)" },
  new: { background: "var(--color-green-900, #123b2c)", color: "#fff" },
};

export default function ComponentsPage() {
  const [cat, setCat] = useState<Category | "전체">("전체");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return catalog.filter((c) => {
      const byCat = cat === "전체" || c.category === cat;
      const t = q.trim().toLowerCase();
      const byQ = !t || c.name.toLowerCase().includes(t) || c.blurb.toLowerCase().includes(t);
      return byCat && byQ;
    });
  }, [cat, q]);

  const pill = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: "var(--radius-full)", fontWeight: 600, fontSize: "var(--font-size-caption)",
    border: "1px solid var(--color-border-default)", cursor: "pointer",
    background: active ? "var(--color-green-900, #123b2c)" : "var(--color-background-default)",
    color: active ? "#fff" : "var(--color-text-primary)",
  });

  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>
        COMPONENTS · {catalog.length}
      </div>
      <h1 style={{ fontSize: "var(--font-size-display)", fontWeight: 800, margin: "var(--spacing-2) 0" }}>컴포넌트</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-6)" }}>
        모든 컴포넌트는 React와 Figma에서 동일한 이름, 동일한 속성으로 제공됩니다.
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="컴포넌트 검색..."
        style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-default)", marginBottom: "var(--spacing-4)", fontSize: "var(--font-size-body)" }}
      />

      <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginBottom: "var(--spacing-6)" }}>
        <button style={pill(cat === "전체")} onClick={() => setCat("전체")}>전체 {catalog.length}</button>
        {categoryOrder.map((c) => {
          const n = catalog.filter((x) => x.category === c).length;
          return <button key={c} style={pill(cat === c)} onClick={() => setCat(c)}>{c} {n}</button>;
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--spacing-4)" }}>
        {filtered.map((c) => (
          <a key={c.slug} href={`/components/${c.slug}`} style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 120, background: "var(--color-background-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-brand-primary)", fontWeight: 800, fontSize: "var(--font-size-title)" }}>
              {c.name}
            </div>
            <div style={{ padding: "var(--spacing-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{c.name}</strong>
                <span style={{ ...STATUS_STYLE[c.status], padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 700 }}>{STATUS_LABEL[c.status]}</span>
              </div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>{c.blurb}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
