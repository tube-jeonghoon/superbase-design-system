"use client";
import { useTokenValue } from "./useTokenValue";

export function TokenValue({ cssVar }: { cssVar: string }) {
  const value = useTokenValue(cssVar);
  return (
    <span style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-text-secondary)" }}>
      {value}
    </span>
  );
}
