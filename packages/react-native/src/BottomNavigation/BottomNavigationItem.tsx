import type { ReactNode } from "react";
import { Pressable, Text as RNText, View, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useBottomNavigationContext } from "./BottomNavigationContext";

export interface BottomNavigationItemProps {
  value: string;
  icon: (active: boolean) => ReactNode;
  label: ReactNode;
  disabled?: boolean;
}

export function BottomNavigationItem({ value, icon, label, disabled = false }: BottomNavigationItemProps) {
  const t = useTheme();
  const { value: active, onChange } = useBottomNavigationContext();
  const selected = active === value;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(value)}
      style={{
        flex: 1,
        alignItems: "center",
        gap: t.spacing["1"],
        paddingVertical: t.spacing["2"],
        paddingHorizontal: t.spacing["1"],
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View>{icon(selected)}</View>
      <RNText
        numberOfLines={1}
        style={{
          fontSize: t.font.size.caption,
          fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          color: selected ? t.color.brand.primary : t.color.text.secondary,
        }}
      >
        {label}
      </RNText>
    </Pressable>
  );
}
