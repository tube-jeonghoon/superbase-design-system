import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderBrandProps {
  children: ReactNode;
}

export function HeaderBrand({ children }: HeaderBrandProps) {
  useHeaderContext();
  return <div className={styles.brand}>{children}</div>;
}
