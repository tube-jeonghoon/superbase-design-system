import { forwardRef, type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, variant = "neutral", className },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
});
