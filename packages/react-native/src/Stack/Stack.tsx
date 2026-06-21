import { forwardRef, type ElementRef } from "react";
import { View, type ViewProps, type FlexStyle } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
}

export const Stack = forwardRef<ElementRef<typeof View>, StackProps>(function Stack(
  { direction = "column", gap = 0, padding = 0, align, justify, style, ...rest },
  ref,
) {
  const t = useTheme();
  const SPACING: Record<SpacingScale, number> = {
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
          flexDirection: direction,
          gap: SPACING[gap],
          padding: SPACING[padding],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    />
  );
});
