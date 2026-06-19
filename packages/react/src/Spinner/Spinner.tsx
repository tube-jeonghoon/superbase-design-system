import type { CSSProperties } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

export function Spinner({
  size = "md",
  color,
  className,
  "aria-label": ariaLabel = "로딩 중",
  ...rest
}: SpinnerProps) {
  const style = color
    ? ({ "--spinner-color": color } as CSSProperties)
    : undefined;
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      style={style}
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
