import { forwardRef, type CSSProperties, type ReactNode } from "react";
import styles from "./Stack.module.css";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps {
  children: ReactNode;
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  className?: string;
}

const spacingValue = (n: SpacingScale): string => (n === 0 ? "0" : `var(--spacing-${n})`);

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { children, direction = "column", gap = 0, padding = 0, align, justify, className },
  ref,
) {
  const style: CSSProperties = {
    display: "flex",
    flexDirection: direction,
    gap: spacingValue(gap),
    padding: spacingValue(padding),
    alignItems: align,
    justifyContent: justify,
  };
  return (
    <div
      ref={ref}
      data-direction={direction}
      className={[styles.stack, className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});
