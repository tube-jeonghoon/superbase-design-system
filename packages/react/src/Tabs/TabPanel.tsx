import type { ReactNode } from "react";
import { useTabsContext } from "./TabsContext";
import styles from "./Tabs.module.css";

export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={[styles.panel, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
