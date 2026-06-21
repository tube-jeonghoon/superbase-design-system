import { forwardRef, type ReactNode } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, indeterminate = false, onChange, disabled = false, label, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      data-indeterminate={indeterminate ? "true" : undefined}
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
});
