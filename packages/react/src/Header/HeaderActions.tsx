import type { ReactNode } from "react";
import { useHeaderContext } from "./HeaderContext";
import styles from "./Header.module.css";

export interface HeaderActionsProps {
  children: ReactNode;
}

export function HeaderActions({ children }: HeaderActionsProps) {
  useHeaderContext();
  return <div className={styles.actions}>{children}</div>;
}
