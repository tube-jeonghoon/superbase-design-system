import type { ReactNode } from "react";
import { View } from "react-native";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderBrandProps {
  children: ReactNode;
}

export function HeaderBrand({ children }: HeaderBrandProps) {
  useHeaderContext();
  return <View style={{ flexShrink: 0 }}>{children}</View>;
}
