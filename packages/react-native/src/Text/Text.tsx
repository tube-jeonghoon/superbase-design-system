import { forwardRef, type ElementRef } from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
}

export const Text = forwardRef<ElementRef<typeof RNText>, TextProps>(function Text(
  { variant = "body", weight = "regular", color = "primary", style, ...rest },
  ref,
) {
  const t = useTheme();
  const colorFor: Record<TextColor, string> = {
    primary: t.color.text.primary,
    secondary: t.color.text.secondary,
    disabled: t.color.text.disabled,
    brand: t.color.brand.primary,
  };
  return (
    <RNText
      ref={ref}
      style={[
        {
          fontSize: t.font.size[variant],
          lineHeight: t.font.size[variant] * t.lineHeight[variant],
          fontWeight: String(t.font.weight[weight]) as TextStyle["fontWeight"],
          color: colorFor[color],
        },
        style,
      ]}
      {...rest}
    />
  );
});
