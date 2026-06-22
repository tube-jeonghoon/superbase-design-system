import type { ReactNode } from "react";
import { useBottomNavigationContext } from "./BottomNavigationContext";
import styles from "./BottomNavigation.module.css";

export interface BottomNavigationItemProps {
  value: string;
  icon: (active: boolean) => ReactNode;
  label: ReactNode;
  disabled?: boolean;
}

export function BottomNavigationItem({ value, icon, label, disabled = false }: BottomNavigationItemProps) {
  const { value: active, onChange } = useBottomNavigationContext();
  const selected = active === value;
  return (
    <button
      type="button"
      className={styles.item}
      data-active={selected ? "true" : undefined}
      aria-current={selected ? "page" : undefined}
      disabled={disabled}
      onClick={() => onChange?.(value)}
    >
      <span className={styles.icon}>{icon(selected)}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
