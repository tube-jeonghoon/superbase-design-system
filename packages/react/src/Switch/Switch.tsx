import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, disabled = false, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      className={[styles.switch, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(!checked)}
      {...rest}
    >
      <span className={styles.thumb} />
    </button>
  );
});
