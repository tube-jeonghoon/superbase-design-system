import { forwardRef, type ReactNode } from "react";
import { RadioContext } from "./RadioContext";
import styles from "./Radio.module.css";

export interface RadioGroupProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { value, onChange, children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="radiogroup"
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <RadioContext.Provider value={{ value, onChange }}>
        {children}
      </RadioContext.Provider>
    </div>
  );
});
