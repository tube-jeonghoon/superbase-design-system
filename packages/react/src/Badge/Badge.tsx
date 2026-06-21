import { forwardRef, type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, variant = "neutral", size = "md", icon, dot = false, className },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={[styles.badge, className].filter(Boolean).join(" ")}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
});
