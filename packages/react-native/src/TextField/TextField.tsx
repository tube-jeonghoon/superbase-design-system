import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Text as RNText, TextInput, Pressable, type TextInputProps } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Icon } from "../Icon/Icon";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: TextFieldSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
}

export const TextField = forwardRef<ElementRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, helperText, size = "md", prefix, suffix, clearable = false, value, onChangeText, style, ...rest },
  ref,
) {
  const t = useTheme();
  const heightFor: Record<TextFieldSize, number> = {
    sm: t.size.fieldSm,
    md: t.size.field,
    lg: t.size.fieldLg,
  };
  const showClear = clearable && value != null && value !== "";
  return (
    <View style={{ gap: t.spacing["1"] }}>
      {label ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>
          {label}
        </RNText>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["2"],
          height: heightFor[size],
          paddingHorizontal: t.spacing["4"],
          borderWidth: t.borderWidth.thin,
          borderColor: error ? t.color.status.danger : t.color.border.default,
          borderRadius: t.radius.md,
          backgroundColor: t.color.background.default,
        }}
      >
        {prefix}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          style={[
            { flex: 1, height: "100%", padding: 0, fontSize: t.font.size.body, color: t.color.text.primary },
            style,
          ]}
          {...rest}
        />
        {showClear ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear" onPress={() => onChangeText?.("")}>
            <Icon name="close" size={16} color={t.color.text.secondary} />
          </Pressable>
        ) : null}
        {suffix}
      </View>
      {error ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.status.danger }}>{error}</RNText>
      ) : helperText ? (
        <RNText style={{ fontSize: t.font.size.caption, color: t.color.text.secondary }}>{helperText}</RNText>
      ) : null}
    </View>
  );
});
