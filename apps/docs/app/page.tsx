"use client";
import { releases } from "../lib/releases";

const TOKENS = [
  { name: "brand.primary", role: "Primary · 액션", cssVar: "--color-brand-primary" },
  { name: "green.900", role: "히어로 · 푸터", cssVar: "--color-green-900" },
  { name: "neutral.500", role: "보조 텍스트", cssVar: "--color-neutral-500" },
  { name: "background.subtle", role: "Surface · 배경", cssVar: "--color-background-subtle" },
];

const panel: React.CSSProperties = {
  background: "var(--color-green-900, #123b2c)",
  color: "#fff",
  borderRadius: "var(--radius-lg)",
  padding: "var(--spacing-8)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
      <section style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "var(--spacing-6)" }}>
        <div style={panel}>
          <span style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em", color: "var(--color-green-300, #7fe6bc)", fontSize: "var(--font-size-caption)", fontWeight: 700 }}>
            SUPERBASE DESIGN SYSTEM
          </span>
          <h1 style={{ fontSize: "44px", fontWeight: 800, lineHeight: 1.2, margin: "var(--spacing-4) 0" }}>
            하나의 언어로,<br />모든 제품을.
          </h1>
          <p style={{ fontSize: "var(--font-size-body)", opacity: 0.9, marginBottom: "var(--spacing-6)" }}>
            토큰부터 컴포넌트, 가이드라인까지 — 팀 전체가 같은 기준으로 만들고 검증합니다.
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <a href="/components" style={{ background: "var(--color-green-300, #7fe6bc)", color: "var(--color-green-900, #123b2c)", fontWeight: 700, padding: "12px 22px", borderRadius: "var(--radius-md)" }}>시작하기</a>
            <a href="/foundations" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontWeight: 700, padding: "12px 22px", borderRadius: "var(--radius-md)" }}>Docs 보기</a>
          </div>
        </div>
        <div style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-6)", background: "var(--color-background-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }}>
            <strong>Design Tokens</strong>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)" }}>tokens.css</span>
          </div>
          {TOKENS.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "var(--spacing-3) 0", borderTop: "1px solid var(--color-background-subtle)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `var(${t.cssVar})`, border: "1px solid var(--color-border-default)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>{t.name}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="principles">
        <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 800, marginBottom: "var(--spacing-4)" }}>우리가 지키는 세 가지 원칙</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-6)" }}>
          {[
            { n: "PRINCIPLE 01", t: "Clarity first", d: "화려함보다 명확함. 사용자가 다음 행동을 고민하지 않게 합니다." },
            { n: "PRINCIPLE 02", t: "Token-driven", d: "색·간격·타이포는 전부 토큰으로. 디자인과 코드가 하나의 소스를 공유합니다." },
            { n: "PRINCIPLE 03", t: "Open by default", d: "모든 결정은 공개 문서로. 누구나 제안하고 기여할 수 있습니다." },
          ].map((p) => (
            <div key={p.n}>
              <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>{p.n}</div>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)", margin: "var(--spacing-2) 0" }}>{p.t}</div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)" }}>{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)" }}>
        <a href="/foundations" style={{ border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-6)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>디자이너로 시작하기 →</div>
          <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>Figma 라이브러리 · 템플릿 · 아이콘 세트</div>
        </a>
        <a href="/components" style={{ ...panel, padding: "var(--spacing-6)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-body)" }}>개발자로 시작하기 →</div>
          <div style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-green-300, #7fe6bc)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>$ npm install @superbase/react</div>
        </a>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-4)" }}>
          <h2 style={{ fontSize: "var(--font-size-title)", fontWeight: 800 }}>Releases</h2>
          <a href="/releases" style={{ color: "var(--color-brand-primary)", fontWeight: 700, fontSize: "var(--font-size-caption)" }}>모든 릴리즈 보기 →</a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          {releases.slice(0, 3).map((r) => (
            <div key={r.version} style={{ display: "flex", gap: "var(--spacing-4)", alignItems: "baseline" }}>
              <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-brand-primary)", fontWeight: 700, minWidth: 64 }}>v{r.version}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{r.title}</div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-caption)", marginTop: "var(--spacing-2)" }}>{r.summary}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
