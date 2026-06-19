"use client";
import { Text } from "@superbase/react";
import { useTokenValue } from "./useTokenValue";
import styles from "./Swatch.module.css";

export function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  const value = useTokenValue(cssVar);
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={{ background: `var(${cssVar})` }} />
      <div className={styles.meta}>
        <Text variant="caption" weight="medium">
          {name}
        </Text>
        <span className={styles.value}>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
