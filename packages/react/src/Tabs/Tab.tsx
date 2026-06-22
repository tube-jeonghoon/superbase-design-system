import type { ReactNode } from "react";
import { useTabsContext } from "./TabsContext";
import styles from "./Tabs.module.css";

export interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Tab({ value, children, disabled = false, className }: TabProps) {
  const { value: active, onChange } = useTabsContext();
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      data-value={value}
      aria-selected={selected}
      aria-controls={`panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-selected={selected ? "true" : undefined}
      className={[styles.tab, className].filter(Boolean).join(" ")}
      onClick={() => onChange?.(value)}
    >
      {children}
    </button>
  );
}
