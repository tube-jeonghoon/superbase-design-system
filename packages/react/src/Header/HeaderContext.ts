import { createContext, useContext } from "react";

// Presence marker only — Header parts share no state; the context exists
// purely to enforce composition (parts must render inside <Header>).
export type HeaderContextValue = Record<string, never>;

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeaderContext(): HeaderContextValue {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("Header 컴파운드 컴포넌트는 <Header> 내부에서 사용해야 합니다");
  return ctx;
}
