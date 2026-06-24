import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { HeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export type HeaderVariant = "bar" | "floating";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  variant?: HeaderVariant;
  onBack?: () => void;
  children: ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { variant = "bar", onBack, children, className, "aria-label": ariaLabel = "앱 헤더", ...rest },
  ref,
) {
  return (
    <header
      ref={ref}
      aria-label={ariaLabel}
      data-variant={variant}
      className={[styles.header, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {onBack && (
        <button type="button" className={styles.back} aria-label="뒤로" onClick={onBack}>
          <Icon name="arrow-left" size="sm" />
        </button>
      )}
      <HeaderContext.Provider value={{}}>{children}</HeaderContext.Provider>
    </header>
  );
});
