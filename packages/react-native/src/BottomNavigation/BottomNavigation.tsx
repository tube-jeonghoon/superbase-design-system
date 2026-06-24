import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, Pressable, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { BottomNavigationContext } from "./BottomNavigationContext";

export type BottomNavigationVariant = "bar" | "floating";

export interface BottomNavigationProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  onBack?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: BottomNavigationVariant;
}

export const BottomNavigation = forwardRef<ElementRef<typeof View>, BottomNavigationProps>(function BottomNavigation(
  { value, onChange, onBack, children, "aria-label": ariaLabel = "Bottom navigation", style, variant = "bar", ...rest },
  ref,
) {
  const t = useTheme();
  const variantStyle: ViewStyle =
    variant === "floating"
      ? {
          borderRadius: t.radius.full,
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border.default,
          ...t.shadow.sm,
        }
      : {
          borderTopWidth: t.borderWidth.thin,
          borderTopColor: t.color.border.default,
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
          gap: t.spacing["1"],
          paddingHorizontal: t.spacing["3"],
          paddingVertical: t.spacing["2"],
          backgroundColor: t.color.background.default,
        },
        variantStyle,
        style,
      ]}
    >
      {onBack ? (
        <>
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
          <View
            style={{
              width: t.borderWidth.thin,
              alignSelf: "stretch",
              marginHorizontal: t.spacing["1"],
              marginVertical: t.spacing["2"],
              backgroundColor: t.color.border.default,
            }}
          />
        </>
      ) : null}
      <BottomNavigationContext.Provider value={{ value, onChange }}>
        {children}
      </BottomNavigationContext.Provider>
    </View>
  );
});
