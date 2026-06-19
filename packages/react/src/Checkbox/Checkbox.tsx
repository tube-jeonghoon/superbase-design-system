import type { ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.checkbox, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span className={styles.box} aria-hidden="true">
        <span className={styles.check} />
      </span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </button>
  );
}
