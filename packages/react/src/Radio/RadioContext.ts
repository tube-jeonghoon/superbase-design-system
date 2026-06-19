import { createContext, useContext } from "react";

export interface RadioContextValue {
  value: string;
  onChange?: (value: string) => void;
}

export const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadioContext(): RadioContextValue {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("Radio must be used within a RadioGroup");
  return ctx;
}
