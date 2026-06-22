import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type CardElevation = "none" | "sm" | "md" | "lg";
export type CardPadding = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface CardProps extends ViewProps {
  children: ReactNode;
  elevation?: CardElevation;
  bordered?: boolean;
  padding?: CardPadding;
  style?: StyleProp<ViewStyle>;
}

export const Card = forwardRef<ElementRef<typeof View>, CardProps>(function Card(
  { children, elevation = "sm", bordered = false, padding = 4, style, ...rest },
  ref,
) {
  const t = useTheme();
  const pad: Record<CardPadding, number> = {
    0: 0,
    1: t.spacing["1"],
    2: t.spacing["2"],
    3: t.spacing["3"],
    4: t.spacing["4"],
    6: t.spacing["6"],
    8: t.spacing["8"],
  };
  return (
    <View
      ref={ref}
      style={[
        {
          backgroundColor: t.color.background.default,
          borderRadius: t.radius.lg,
          padding: pad[padding],
          ...(elevation !== "none" ? t.shadow[elevation] : null),
          ...(bordered ? { borderWidth: t.borderWidth.thin, borderColor: t.color.border.default } : null),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
});
