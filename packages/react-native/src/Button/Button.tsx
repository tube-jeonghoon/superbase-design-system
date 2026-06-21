import { forwardRef, type ElementRef } from "react";
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  // object/array styles only — Pressable's function-style form is intentionally
  // not supported so it can't be silently dropped into the style array below.
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", disabled = false, style, ...rest },
  ref,
) {
  const t = useTheme();
  const padFor: Record<ButtonSize, number> = {
    sm: t.spacing["3"],
    md: t.spacing["4"],
    lg: t.spacing["6"],
  };
  const bg = variant === "primary" ? t.color.brand.primary : t.color.background.subtle;
  const fg = variant === "primary" ? "#ffffff" : t.color.text.primary;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={disabled}
      style={[
        {
          height: t.size.button[size],
          paddingHorizontal: padFor[size],
          borderRadius: t.radius.md,
          backgroundColor: bg,
          opacity: disabled ? t.opacity.disabled : 1,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      {...rest}
    >
      <RNText
        style={{
          color: fg,
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
        }}
      >
        {children}
      </RNText>
    </Pressable>
  );
});
