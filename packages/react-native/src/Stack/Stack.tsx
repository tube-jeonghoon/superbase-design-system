import { View, type ViewProps, type FlexStyle } from "react-native";
import {
  Spacing1,
  Spacing2,
  Spacing3,
  Spacing4,
  Spacing6,
  Spacing8,
} from "@thesuperbase/tokens/native";

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 6 | 8;

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpacingScale;
  padding?: SpacingScale;
  align?: FlexStyle["alignItems"];
  justify?: FlexStyle["justifyContent"];
}

const SPACING: Record<SpacingScale, number> = {
  0: 0,
  1: Spacing1,
  2: Spacing2,
  3: Spacing3,
  4: Spacing4,
  6: Spacing6,
  8: Spacing8,
};

export function Stack({
  direction = "column",
  gap = 0,
  padding = 0,
  align,
  justify,
  style,
  ...rest
}: StackProps) {
  return (
    <View
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
}
