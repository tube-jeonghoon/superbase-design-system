import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import {
  ColorTextPrimary,
  ColorTextSecondary,
  ColorTextDisabled,
  ColorBrandPrimary,
  FontSizeCaption,
  FontSizeBody,
  FontSizeTitle,
  FontSizeDisplay,
  FontWeightRegular,
  FontWeightMedium,
  FontWeightBold,
} from "@superbase/tokens/native";

export type TextVariant = "caption" | "body" | "title" | "display";
export type TextWeight = "regular" | "medium" | "bold";
export type TextColor = "primary" | "secondary" | "disabled" | "brand";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
}

const sizeFor: Record<TextVariant, number> = {
  caption: FontSizeCaption,
  body: FontSizeBody,
  title: FontSizeTitle,
  display: FontSizeDisplay,
};
const weightFor: Record<TextWeight, TextStyle["fontWeight"]> = {
  regular: FontWeightRegular as TextStyle["fontWeight"],
  medium: FontWeightMedium as TextStyle["fontWeight"],
  bold: FontWeightBold as TextStyle["fontWeight"],
};
const colorFor: Record<TextColor, string> = {
  primary: ColorTextPrimary,
  secondary: ColorTextSecondary,
  disabled: ColorTextDisabled,
  brand: ColorBrandPrimary,
};

export function Text({
  variant = "body",
  weight = "regular",
  color = "primary",
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        {
          fontSize: sizeFor[variant],
          fontWeight: weightFor[weight],
          color: colorFor[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
