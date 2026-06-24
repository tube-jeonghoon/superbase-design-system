import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderActionsProps {
  children: ReactNode;
}

export function HeaderActions({ children }: HeaderActionsProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <View style={{ flexShrink: 0, flexDirection: "row", alignItems: "center", gap: t.spacing["1"] }}>
      {children}
    </View>
  );
}
