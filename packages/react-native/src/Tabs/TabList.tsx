import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface TabListProps {
  children: ReactNode;
  "aria-label"?: string;
}

export function TabList({ children, "aria-label": ariaLabel }: TabListProps) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      aria-label={ariaLabel}
      style={{
        flexDirection: "row",
        gap: t.spacing["1"],
        borderBottomWidth: t.borderWidth.thin,
        borderBottomColor: t.color.border.default,
      }}
    >
      {children}
    </View>
  );
}
