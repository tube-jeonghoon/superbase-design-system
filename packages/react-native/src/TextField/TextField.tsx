import { View, Text as RNText, TextInput, type TextInputProps } from "react-native";
import {
  ColorTextPrimary,
  ColorTextSecondary,
  ColorBorderDefault,
  ColorRed500,
  RadiusMd,
  Spacing1,
  Spacing4,
  FontSizeBody,
  FontSizeCaption,
} from "@thesuperbase/tokens/native";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={{ gap: Spacing1 }}>
      {label ? (
        <RNText style={{ fontSize: FontSizeCaption, color: ColorTextSecondary }}>
          {label}
        </RNText>
      ) : null}
      <TextInput
        style={[
          {
            height: 48,
            paddingHorizontal: Spacing4,
            borderWidth: 1,
            borderColor: error ? ColorRed500 : ColorBorderDefault,
            borderRadius: RadiusMd,
            fontSize: FontSizeBody,
            color: ColorTextPrimary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={{ fontSize: FontSizeCaption, color: ColorRed500 }}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
}
