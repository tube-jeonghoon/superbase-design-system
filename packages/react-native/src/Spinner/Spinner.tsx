import { forwardRef, type ElementRef } from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "size" | "color"> {
  size?: SpinnerSize;
  color?: string;
}

// ActivityIndicator's size is the semantic "small" | "large" | number, not a design token.
const sizeFor: Record<SpinnerSize, ActivityIndicatorProps["size"]> = {
  sm: "small",
  md: 28,
  lg: "large",
};

export const Spinner = forwardRef<ElementRef<typeof ActivityIndicator>, SpinnerProps>(function Spinner(
  { size = "md", color, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <ActivityIndicator
      ref={ref}
      size={sizeFor[size]}
      color={color ?? t.color.brand.primary}
      accessibilityLabel="Loading"
      {...rest}
    />
  );
});
