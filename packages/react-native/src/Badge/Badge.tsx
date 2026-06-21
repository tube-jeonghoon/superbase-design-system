import { forwardRef, type ElementRef } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

export const Badge = forwardRef<ElementRef<typeof View>, BadgeProps>(function Badge(
  { children, variant = "neutral" },
  ref,
) {
  const t = useTheme();
  const bgFor: Record<BadgeVariant, string> = {
    neutral: t.color.background.subtle,
    brand: t.color.brand.primary,
    success: t.color.status.success,
    warning: t.color.status.warning,
    danger: t.color.status.danger,
  };
  const fgFor: Record<BadgeVariant, string> = {
    neutral: t.color.text.secondary,
    brand: "#ffffff",
    success: "#ffffff",
    warning: "#ffffff",
    danger: "#ffffff",
  };
  return (
    <View
      ref={ref}
      style={{
        alignSelf: "flex-start",
        paddingVertical: 2,
        paddingHorizontal: t.spacing["2"],
        borderRadius: t.radius.full,
        backgroundColor: bgFor[variant],
      }}
    >
      <RNText
        style={{
          fontSize: t.font.size.caption,
          fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          color: fgFor[variant],
        }}
      >
        {children}
      </RNText>
    </View>
  );
});
