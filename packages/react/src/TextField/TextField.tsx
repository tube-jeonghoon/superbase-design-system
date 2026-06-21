import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./TextField.module.css";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "size" | "prefix"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: TextFieldSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, helperText, id, value, onChange, size = "md", prefix, suffix, clearable = false, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const showClear = clearable && value != null && value !== "";
  const describedBy = error ? errorId : helperText ? helperId : undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <div className={styles.control} data-size={size} data-error={error ? "true" : undefined}>
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          {...rest}
        />
        {showClear ? (
          <button type="button" className={styles.clear} aria-label="Clear" onClick={() => onChange?.("")}>
            <Icon name="close" size={16} />
          </button>
        ) : null}
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
      </div>
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className={styles.helper}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
