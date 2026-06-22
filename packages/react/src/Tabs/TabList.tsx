import { useRef, type ReactNode } from "react";
import { useTabsContext } from "./TabsContext";
import styles from "./Tabs.module.css";

export interface TabListProps {
  children: ReactNode;
  "aria-label"?: string;
  className?: string;
}

export function TabList({ children, "aria-label": ariaLabel, className }: TabListProps) {
  const { value, onChange } = useTabsContext();
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    if (tabs.length === 0) return;
    const values = tabs.map((t) => t.dataset.value ?? "");
    const cur = values.indexOf(value);
    let next = cur < 0 ? 0 : cur;
    if (e.key === "ArrowRight") next = (cur + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (cur - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    e.preventDefault();
    onChange?.(values[next]);
    tabs[next].focus();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      className={[styles.tablist, className].filter(Boolean).join(" ")}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
