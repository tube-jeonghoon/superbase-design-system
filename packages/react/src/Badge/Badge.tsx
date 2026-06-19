import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      data-variant={variant}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
