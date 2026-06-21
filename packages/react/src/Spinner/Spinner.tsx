import { forwardRef, type CSSProperties } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", color, className, "aria-label": ariaLabel = "Loading", ...rest },
  ref,
) {
  const style = color ? ({ "--spinner-color": color } as CSSProperties) : undefined;
  return (
    <span
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      style={style}
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
});
