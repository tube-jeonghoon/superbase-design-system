import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Text as RNText, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
}

export const Badge = forwardRef<ElementRef<typeof View>, BadgeProps>(function Badge(
  { children, variant = "neutral", size = "md", icon, dot = false },
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
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing["1"],
        alignSelf: "flex-start",
        paddingVertical: size === "sm" ? 1 : 2,
        paddingHorizontal: size === "sm" ? t.spacing["1"] : t.spacing["2"],
        borderRadius: t.radius.full,
        backgroundColor: bgFor[variant],
      }}
    >
      {dot ? (
        <View style={{ width: 6, height: 6, borderRadius: t.radius.full, backgroundColor: fgFor[variant] }} />
      ) : null}
      {icon}
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
