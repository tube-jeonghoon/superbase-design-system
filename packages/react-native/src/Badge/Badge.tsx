import { View, Text as RNText } from "react-native";
import {
  ColorBackgroundSubtle,
  ColorTextSecondary,
  ColorBrandPrimary,
  ColorWhite,
  ColorStatusSuccess,
  ColorStatusWarning,
  ColorStatusDanger,
  RadiusFull,
  Spacing2,
  FontSizeCaption,
} from "@superbase/tokens/native";

export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger";

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
}

const bgFor: Record<BadgeVariant, string> = {
  neutral: ColorBackgroundSubtle,
  brand: ColorBrandPrimary,
  success: ColorStatusSuccess,
  warning: ColorStatusWarning,
  danger: ColorStatusDanger,
};
const fgFor: Record<BadgeVariant, string> = {
  neutral: ColorTextSecondary,
  brand: ColorWhite,
  success: ColorWhite,
  warning: ColorWhite,
  danger: ColorWhite,
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 2,
        paddingHorizontal: Spacing2,
        borderRadius: RadiusFull,
        backgroundColor: bgFor[variant],
      }}
    >
      <RNText
        style={{ fontSize: FontSizeCaption, fontWeight: "500", color: fgFor[variant] }}
      >
        {children}
      </RNText>
    </View>
  );
}
