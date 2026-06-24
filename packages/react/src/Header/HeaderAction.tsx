import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: ReactNode;
  label: string;
  badge?: boolean;
}

export const HeaderAction = forwardRef<HTMLButtonElement, HeaderActionProps>(function HeaderAction(
  { icon, label, badge = false, className, ...rest },
  ref,
) {
  useHeaderContext();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={[styles.action, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {icon}
      {badge && <span className={styles.badge} data-badge="true" aria-hidden="true" />}
    </button>
  );
});
