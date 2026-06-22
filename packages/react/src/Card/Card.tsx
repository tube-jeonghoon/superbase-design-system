import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Card.module.css";

export type CardElevation = "none" | "sm" | "md" | "lg";
export type CardPadding = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: CardElevation;
  bordered?: boolean;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, elevation = "sm", bordered = false, padding = 4, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-elevation={elevation}
      data-bordered={bordered ? "true" : undefined}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={{ padding: padding === 0 ? 0 : `var(--spacing-${padding})`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});
