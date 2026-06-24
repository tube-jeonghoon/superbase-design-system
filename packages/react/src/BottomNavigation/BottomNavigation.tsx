import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { BottomNavigationContext } from "./BottomNavigationContext";
import styles from "./BottomNavigation.module.css";

export type BottomNavigationVariant = "bar" | "floating";

export interface BottomNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  variant?: BottomNavigationVariant;
  children: ReactNode;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, variant = "bar", children, className, "aria-label": ariaLabel = "Bottom navigation", ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      data-variant={variant}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {onBack && (
        <>
          <button type="button" className={styles.back} aria-label="뒤로" onClick={onBack}>
            <Icon name="arrow-left" size="sm" />
          </button>
          <span className={styles.divider} aria-hidden="true" />
        </>
      )}
      <BottomNavigationContext.Provider value={{ value, onChange }}>
        {children}
      </BottomNavigationContext.Provider>
    </nav>
  );
});
