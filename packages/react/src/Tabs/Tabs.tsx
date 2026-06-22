import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { TabsContext } from "./TabsContext";
import styles from "./Tabs.module.css";

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, onChange, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={[styles.tabs, className].filter(Boolean).join(" ")} {...rest}>
      <TabsContext.Provider value={{ value, onChange }}>{children}</TabsContext.Provider>
    </div>
  );
});
