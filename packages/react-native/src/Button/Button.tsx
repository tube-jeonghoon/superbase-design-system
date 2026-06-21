import { forwardRef, type ElementRef, type ReactNode } from "react";
import {
  Pressable,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";
import { Spinner } from "../Spinner/Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  // object/array styles only — Pressable's function-style form is intentionally
  // not supported so it can't be silently dropped into the style array below.
  style?: StyleProp<ViewStyle>;
}

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    onPress,
    style,
    ...rest
  },
  ref,
) {
  const t = useTheme();
  const padFor: Record<ButtonSize, number> = {
    sm: t.spacing["3"],
    md: t.spacing["4"],
    lg: t.spacing["6"],
  };
  const bg =
    variant === "primary"
      ? t.color.brand.primary
      : variant === "secondary"
        ? t.color.background.subtle
        : "transparent";
  const fg =
    variant === "primary"
      ? "#ffffff"
      : variant === "ghost"
        ? t.color.brand.primary
        : t.color.text.primary;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={loading ? undefined : onPress}
      style={[
        {
          height: t.size.button[size],
          paddingHorizontal: padFor[size],
          borderRadius: t.radius.md,
          backgroundColor: bg,
          borderWidth: variant === "outline" ? t.borderWidth.thin : 0,
          borderColor: t.color.border.default,
          opacity: disabled ? t.opacity.disabled : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: t.spacing["2"],
          alignSelf: fullWidth ? "stretch" : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={fg} /> : startIcon}
      <RNText
        style={{
          color: fg,
          fontSize: t.font.size.body,
          fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"],
        }}
      >
        {children}
      </RNText>
      {!loading ? endIcon : null}
    </Pressable>
  );
});
