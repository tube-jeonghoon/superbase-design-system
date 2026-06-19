"use client";
import { ComponentDoc } from "../components/docs/ComponentDoc";
import { CodeBlock } from "../components/docs/CodeBlock";

const NEXT = [
  { href: "/foundations", title: "Foundations", desc: "색·타이포·간격·반경 토큰" },
  { href: "/components", title: "Components", desc: "버튼·입력·뱃지 등 컴포넌트 9종" },
  { href: "/components/icon", title: "Icon", desc: "라인 아이콘 18종" },
];

const h2: React.CSSProperties = {
  fontSize: "var(--font-size-title)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: "var(--spacing-8) 0 0",
};
const sub: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
  margin: "var(--spacing-1) 0 0",
};
const summary: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
  margin: "var(--spacing-3) 0 0",
};
const gap: React.CSSProperties = { marginTop: "var(--spacing-3)" };
const card: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--spacing-1)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  padding: "var(--spacing-4)",
};
const cardTitle: React.CSSProperties = {
  fontSize: "var(--font-size-body)",
  fontWeight: 700,
  color: "var(--color-text-primary)",
};
const cardDesc: React.CSSProperties = {
  fontSize: "var(--font-size-caption)",
  color: "var(--color-text-secondary)",
};

export default function HomePage() {
  return (
    <ComponentDoc
      title="Superbase Design System"
      lead="토큰과 컴포넌트를 웹·모바일에서 일관되게 사용하기 위한 디자인 시스템입니다."
    >
      <p style={summary}>토큰 · 웹/모바일 컴포넌트 10종 · 아이콘 · 다크 모드</p>

      <section>
        <h2 style={h2}>설치</h2>
        <p style={sub}>웹 프로젝트에 추가하기.</p>
        <div style={gap}>
          <CodeBlock language="bash" code={`npm install @superbase/tokens @superbase/react`} />
        </div>
        <div style={gap}>
          <CodeBlock
            code={`import "@superbase/tokens/css";\nimport "@superbase/react/styles.css";\nimport { Button, Text } from "@superbase/react";`}
          />
        </div>
      </section>

      <section>
        <h2 style={h2}>둘러보기</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "var(--spacing-3)",
            marginTop: "var(--spacing-4)",
          }}
        >
          {NEXT.map((n) => (
            <a key={n.href} href={n.href} style={card}>
              <span style={cardTitle}>{n.title}</span>
              <span style={cardDesc}>{n.desc}</span>
            </a>
          ))}
        </div>
      </section>
    </ComponentDoc>
  );
}
