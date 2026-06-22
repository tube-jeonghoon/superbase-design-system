import type { ReactNode } from "react";
import { Pressable, Text as RNText } from "react-native";
import { useTabsContext } from "./TabsContext";
import { useTheme } from "../theme/useTheme";

export interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

export function Tab({ value, children, disabled = false }: TabProps) {
  const t = useTheme();
  const { value: active, onChange } = useTabsContext();
  const selected = active === value;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      aria-selected={selected}
      disabled={disabled}
      onPress={() => onChange?.(value)}
      style={{
        paddingVertical: t.spacing["2"],
        paddingHorizontal: t.spacing["3"],
        borderBottomWidth: t.borderWidth.medium,
        borderBottomColor: selected ? t.color.brand.primary : "transparent",
        marginBottom: -t.borderWidth.thin,
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <RNText style={{ fontSize: t.font.size.body, color: selected ? t.color.brand.primary : t.color.text.secondary }}>
        {children}
      </RNText>
    </Pressable>
  );
}
