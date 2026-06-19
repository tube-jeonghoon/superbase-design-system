import type { ReactNode } from "react";
import styles from "./Code.module.css";

export function Code({ children }: { children: ReactNode }) {
  return <code className={styles.code}>{children}</code>;
}
