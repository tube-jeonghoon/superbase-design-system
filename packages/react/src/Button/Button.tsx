import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const spinnerColorFor: Record<ButtonVariant, string> = {
  primary: "var(--color-white)",
  secondary: "var(--color-text-primary)",
  ghost: "var(--color-brand-primary)",
  outline: "var(--color-text-primary)",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    className,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      aria-busy={loading || undefined}
      className={[styles.button, className].filter(Boolean).join(" ")}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? (
        <span className={styles.icon}>
          <Spinner size="sm" color={spinnerColorFor[variant]} aria-label="Loading" />
        </span>
      ) : startIcon ? (
        <span className={styles.icon}>{startIcon}</span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {!loading && endIcon ? <span className={styles.icon}>{endIcon}</span> : null}
    </button>
  );
});
