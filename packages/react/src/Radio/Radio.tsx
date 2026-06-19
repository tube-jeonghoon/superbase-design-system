import type { ReactNode } from "react";
import { useRadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioProps {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Radio({ value, label, disabled = false, className }: RadioProps) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.radio, className].filter(Boolean).join(" ")}
      onClick={() => group.onChange?.(value)}
    >
      <span className={styles.dot} aria-hidden="true" />
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
}
