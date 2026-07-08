import { ComponentDoc } from "../../components/docs/ComponentDoc";
import { Tabs } from "../../components/docs/Tabs";
import { TokenValue } from "../../components/foundations/TokenValue";
import { spacingScale, fontSizes, radii, shadows, effectTokens } from "../../lib/tokens";
import { greenScale, greenRoles, neutralScale, neutralRoles, semanticSwatches, type Shade } from "../../lib/palette";

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
const labelMono: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "var(--font-size-caption)",
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "var(--color-brand-primary)",
  margin: "0 0 var(--spacing-2)",
};
const scaleTitle: React.CSSProperties = {
  fontSize: "var(--font-size-title)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: "var(--spacing-8) 0 var(--spacing-3)",
};
const scaleSubtitle: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  fontWeight: 400,
  color: "var(--color-text-secondary)",
  marginLeft: "var(--spacing-2)",
};
const roleChipBase: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
};
const shadeCaption: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "11px",
  color: "var(--color-text-secondary)",
  lineHeight: 1.4,
};

// 칩 배경색 위에 읽히는 글자색(대비) 선택.
function readableOn(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#123B2C" : "#ffffff";
}

function ScaleBar({ shades }: { shades: Shade[] }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid var(--color-border-default)",
        }}
      >
        {shades.map((s) => (
          <div key={s.step} style={{ flex: 1, height: 96, background: s.hex }} />
        ))}
      </div>
      <div style={{ display: "flex", marginTop: "var(--spacing-2)" }}>
        {shades.map((s) => (
          <div key={s.step} style={{ flex: 1, paddingRight: "var(--spacing-1)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-primary)" }}>{s.step}</div>
            <div style={shadeCaption}>{s.hex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const colorsPanel = (
  <div>
    <div style={eyebrow}>FOUNDATION · COLOR</div>
    <p style={sub}>
      모든 색은 oklch로 설계해 스케일 전체에서 지각적 밝기가 일정하게 유지됩니다. 아래 HEX는 근사값이에요.
    </p>

    <div style={scaleTitle}>
      Green <span style={scaleSubtitle}>브랜드 · 액션 · 하이라이트</span>
    </div>
    <ScaleBar shades={greenScale} />
    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginTop: "var(--spacing-3)" }}>
      {greenRoles.map((r) => (
        <span key={r.label} style={{ ...roleChipBase, background: r.hex, color: readableOn(r.hex) }}>
          {r.label}
        </span>
      ))}
    </div>

    <div style={scaleTitle}>
      Neutral <span style={scaleSubtitle}>그린 틴트 회색 · 텍스트 · 보더 · 서피스</span>
    </div>
    <ScaleBar shades={neutralScale} />
    <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap", marginTop: "var(--spacing-3)" }}>
      {neutralRoles.map((r) => (
        <span
          key={r.label}
          style={{
            ...roleChipBase,
            background: "var(--color-background-default)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-default)",
          }}
        >
          {r.label}
        </span>
      ))}
    </div>

    <div style={scaleTitle}>
      Semantic <span style={scaleSubtitle}>상태 표현 · Success는 Green 스케일을 그대로 사용</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--spacing-4)" }}>
      {semanticSwatches.map((c) => (
        <div
          key={c.name}
          style={{
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-4)",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-body)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "var(--spacing-3)",
            }}
          >
            {c.name}
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            <div style={{ flex: 1, height: 56, borderRadius: "var(--radius-md)", background: c.baseHex }} />
            <div style={{ flex: 1, height: 56, borderRadius: "var(--radius-md)", background: c.softHex }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--spacing-2)" }}>
            <span style={shadeCaption}>{c.baseLabel}</span>
            <span style={shadeCaption}>{c.softLabel}</span>
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: "var(--spacing-3)",
              fontSize: "var(--font-size-caption)",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              background: c.softHex,
              color: c.baseHex,
            }}
          >
            {c.example}
          </span>
        </div>
      ))}
    </div>
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
