import { forwardRef, type ElementType, type ReactNode } from "react";
import styles from "./Text.module.css";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  as?: ElementType;
  className?: string;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { children, variant = "body", weight = "regular", color = "primary", as: Tag = "span", className },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-variant={variant}
      data-weight={weight}
      data-color={color}
      className={[styles.text, className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
});
