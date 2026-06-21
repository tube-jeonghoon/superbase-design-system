import { forwardRef, type ReactNode } from "react";
import { useRadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export type RadioSize = "sm" | "md";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  size?: RadioSize;
  className?: string;
}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { value, label, disabled = false, size = "md", className },
  ref,
) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      data-size={size}
      className={[styles.radio, className].filter(Boolean).join(" ")}
      onClick={() => group.onChange?.(value)}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
});
