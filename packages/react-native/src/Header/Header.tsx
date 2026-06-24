import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Pressable, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { HeaderContext } from "./HeaderContext";

export type HeaderVariant = "bar" | "floating";

export interface HeaderProps extends ViewProps {
  variant?: HeaderVariant;
  onBack?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Header = forwardRef<ElementRef<typeof View>, HeaderProps>(function Header(
  { variant = "bar", onBack, children, "aria-label": ariaLabel = "앱 헤더", style, ...rest },
  ref,
) {
  const t = useTheme();
  const variantStyle: ViewStyle =
    variant === "floating"
      ? {
          borderRadius: t.radius.lg,
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border.default,
          margin: t.spacing["3"],
          ...t.shadow.sm,
        }
      : {
          borderBottomWidth: t.borderWidth.thin,
          borderBottomColor: t.color.border.default,
        };
  return (
    <View
      ref={ref}
      accessibilityLabel={ariaLabel}
      {...rest}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["3"],
          paddingHorizontal: t.spacing["4"],
          paddingVertical: t.spacing["3"],
          backgroundColor: t.color.background.default,
        },
        variantStyle,
        style,
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={onBack}
          style={{
            width: t.size.fieldSm,
            height: t.size.fieldSm,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.full,
            backgroundColor: t.color.background.subtle,
          }}
        >
          <Icon name="arrow-left" size="sm" color={t.color.text.primary} />
        </Pressable>
      ) : null}
      <HeaderContext.Provider value={{}}>{children}</HeaderContext.Provider>
    </View>
  );
});
