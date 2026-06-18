import { Pressable, Text as RNText, type PressableProps, type TextStyle } from "react-native";
import {
  ColorBrandPrimary,
  ColorBackgroundSubtle,
  ColorTextPrimary,
  ColorWhite,
  RadiusMd,
  Spacing3,
  Spacing4,
  Spacing6,
  FontSizeBody,
  FontWeightBold,
} from "@superbase/tokens/native";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const padFor: Record<ButtonSize, number> = { sm: Spacing3, md: Spacing4, lg: Spacing6 };
const heightFor: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const bg = variant === "primary" ? ColorBrandPrimary : ColorBackgroundSubtle;
  const fg = variant === "primary" ? ColorWhite : ColorTextPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        {
          height: heightFor[size],
          paddingHorizontal: padFor[size],
          borderRadius: RadiusMd,
          backgroundColor: bg,
          opacity: disabled ? 0.4 : 1,
          alignItems: "center",
          justifyContent: "center",
        },
        style as object,
      ]}
      {...rest}
    >
      <RNText style={{ color: fg, fontSize: FontSizeBody, fontWeight: FontWeightBold as TextStyle["fontWeight"] }}>
        {children}
      </RNText>
    </Pressable>
  );
}
