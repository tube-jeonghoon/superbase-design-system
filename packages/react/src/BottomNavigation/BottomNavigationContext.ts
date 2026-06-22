import { createContext, useContext } from "react";

export interface BottomNavigationContextValue {
  value: string;
  onChange?: (value: string) => void;
}

export const BottomNavigationContext = createContext<BottomNavigationContextValue | null>(null);

export function useBottomNavigationContext(): BottomNavigationContextValue {
  const ctx = useContext(BottomNavigationContext);
  if (!ctx) throw new Error("BottomNavigationItem must be used within <BottomNavigation>");
  return ctx;
}
