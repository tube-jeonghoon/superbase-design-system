import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, id, value, onChange, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        data-error={error ? "true" : undefined}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
});
