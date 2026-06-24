import type { ReactNode } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export function HeaderTitle({ title, subtitle }: HeaderTitleProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <RNText
        numberOfLines={1}
        style={{
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
          color: t.color.text.primary,
        }}
      >
        {title}
      </RNText>
      {subtitle != null && (
        <RNText
          numberOfLines={1}
          style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}
        >
          {subtitle}
        </RNText>
      )}
    </View>
  );
}
