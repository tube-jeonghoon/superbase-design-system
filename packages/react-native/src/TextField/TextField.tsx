import { forwardRef, type ElementRef } from "react";
import { View, Text as RNText, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<ElementRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing["1"] }}>
      {label ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>
          {label}
        </RNText>
      ) : null}
      <TextInput
        ref={ref}
        style={[
          {
            height: t.size.field,
            paddingHorizontal: t.spacing["4"],
            borderWidth: t.borderWidth.thin,
            borderColor: error ? t.color.status.danger : t.color.border.default,
            borderRadius: t.radius.md,
            fontSize: t.font.size.body,
            color: t.color.text.primary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.status.danger }}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
});
