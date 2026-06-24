import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export function HeaderTitle({ title, subtitle }: HeaderTitleProps) {
  useHeaderContext();
  return (
    <div className={styles.title}>
      <span className={styles.titleText}>{title}</span>
      {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
}
