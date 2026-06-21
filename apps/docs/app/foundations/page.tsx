import { ComponentDoc } from "../../components/docs/ComponentDoc";
import { Tabs } from "../../components/docs/Tabs";
import { Swatch } from "../../components/foundations/Swatch";
import { TokenValue } from "../../components/foundations/TokenValue";
import { semanticColors, spacingScale, fontSizes, radii, shadows, effectTokens, type ColorGroup } from "../../lib/tokens";

const COLOR_GROUPS: { key: ColorGroup; label: string }[] = [
  { key: "text", label: "Text" },
  { key: "brand", label: "Brand & Background" },
  { key: "status", label: "Status" },
];

const sub: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
  margin: "0 0 var(--spacing-4)",
};
const groupLabel: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  fontWeight: 700,
  color: "var(--color-text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  margin: "var(--spacing-4) 0 var(--spacing-2)",
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: "var(--spacing-3)",
};
const labelMono: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

const colorsPanel = (
  <div>
    <p style={sub}>semantic 토큰. 다크 모드에서 값이 함께 바뀝니다.</p>
    {COLOR_GROUPS.map((g) => (
      <div key={g.key}>
        <div style={groupLabel}>{g.label}</div>
        <div style={grid}>
          {semanticColors
            .filter((c) => c.group === g.key)
            .map((c) => (
              <Swatch key={c.cssVar} name={c.name} cssVar={c.cssVar} />
            ))}
        </div>
      </div>
    ))}
  </div>
);

const typographyPanel = (
  <div>
    <p style={sub}>실제 크기로 보는 타입 스케일.</p>
    {fontSizes.map((f) => (
      <div
        key={f.cssVar}
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "var(--spacing-4)",
          padding: "var(--spacing-3) 0",
          borderBottom: "1px solid var(--color-background-subtle)",
        }}
      >
        <span style={{ flex: 1, fontSize: `var(${f.cssVar})`, color: "var(--color-text-primary)" }}>
          {f.name}
        </span>
        <span style={labelMono}>
          {f.name} · <TokenValue cssVar={f.cssVar} />
        </span>
      </div>
    ))}
  </div>
);

const spacingPanel = (
  <div>
    <p style={sub}>4px 기반 스케일.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      {spacingScale.map((n) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
          <div
            style={{
              height: 16,
              width: n === 0 ? "1px" : `var(--spacing-${n})`,
              background: "var(--color-brand-primary)",
              borderRadius: 3,
            }}
          />
          <span style={labelMono}>
            spacing-{n} · <TokenValue cssVar={`--spacing-${n}`} />
          </span>
        </div>
      ))}
    </div>
  </div>
);

const radiusPanel = (
  <div>
    <p style={sub}>모서리 반경.</p>
    <div style={{ display: "flex", gap: "var(--spacing-6)", flexWrap: "wrap" }}>
      {radii.map((r) => (
        <div key={r.cssVar} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-2)" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "var(--color-background-subtle)",
              border: "1px solid var(--color-border-default)",
              borderRadius: `var(${r.cssVar})`,
            }}
          />
          <span style={labelMono}>
            {r.name} · <TokenValue cssVar={r.cssVar} />
          </span>
        </div>
      ))}
    </div>
  </div>
);

const effectsPanel = (
  <div>
    <p style={sub}>그림자·모션·불투명도·보더 등 효과 토큰.</p>
    <div style={groupLabel}>Elevation</div>
    <div style={{ display: "flex", gap: "var(--spacing-6)", flexWrap: "wrap", marginBottom: "var(--spacing-4)" }}>
      {shadows.map((s) => (
        <div key={s.cssVar} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-2)" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "var(--radius-md)",
              background: "var(--color-background-default)",
              boxShadow: `var(${s.cssVar})`,
            }}
          />
          <span style={labelMono}>shadow-{s.name}</span>
        </div>
      ))}
    </div>
    <div style={groupLabel}>Motion · Opacity · Border · Line-height</div>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      {effectTokens.map((tk) => (
        <div
          key={tk.cssVar}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-4)",
            padding: "var(--spacing-2) 0",
            borderBottom: "1px solid var(--color-background-subtle)",
          }}
        >
          <span style={{ flex: 1, fontSize: "var(--font-size-caption)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {tk.name}
          </span>
          <span style={labelMono}>
            <TokenValue cssVar={tk.cssVar} />
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default function FoundationsPage() {
  return (
    <ComponentDoc
      title="Foundations"
      lead="Superbase 디자인 시스템의 토큰. 색·타이포·간격·반경을 실제 값과 함께 보여줍니다."
    >
      <Tabs
        ariaLabel="Foundations 토큰"
        items={[
          { id: "colors", label: "Colors", content: colorsPanel },
          { id: "typography", label: "Typography", content: typographyPanel },
          { id: "spacing", label: "Spacing", content: spacingPanel },
          { id: "radius", label: "Radius", content: radiusPanel },
          { id: "effects", label: "Effects", content: effectsPanel },
        ]}
      />
    </ComponentDoc>
  );
}
