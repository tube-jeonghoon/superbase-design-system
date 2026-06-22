import type { ReactNode } from "react";
import { View } from "react-native";
import { useTabsContext } from "./TabsContext";
import { useTheme } from "../theme/useTheme";

export interface TabPanelProps {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, children }: TabPanelProps) {
  const t = useTheme();
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <View accessibilityRole="none" style={{ paddingVertical: t.spacing["4"] }}>
      {children}
    </View>
  );
}
