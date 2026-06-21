"use client";
import { useState, type ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, ariaLabel }: { items: TabItem[]; ariaLabel?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  return (
    <div>
      <div role="tablist" aria-label={ariaLabel} className={styles.tablist}>
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            data-active={active === t.id}
            className={styles.tab}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
        >
          {active === t.id ? t.content : null}
        </div>
      ))}
    </div>
  );
}
