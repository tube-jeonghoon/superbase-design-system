import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { BottomNavigationContext } from "./BottomNavigationContext";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  children: ReactNode;
}

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, children, className, "aria-label": ariaLabel = "Bottom navigation", ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label={ariaLabel} className={[styles.bar, className].filter(Boolean).join(" ")} {...rest}>
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
