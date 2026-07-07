import { releases } from "../../lib/releases";

export default function ReleasesPage() {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>RELEASES</div>
      <h1 style={{ fontSize: "var(--font-size-display)", fontWeight: 800, margin: "var(--spacing-2) 0 var(--spacing-6)" }}>릴리즈</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
        {releases.map((r) => (
          <div key={r.version} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: "var(--spacing-4)", paddingBottom: "var(--spacing-6)", borderBottom: "1px solid var(--color-border-default)" }}>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700 }}>v{r.version}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>{r.title}</div>
              <p style={{ color: "var(--color-text-secondary)", marginTop: "var(--spacing-2)" }}>{r.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
