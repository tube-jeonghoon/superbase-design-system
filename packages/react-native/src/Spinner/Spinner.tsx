import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { ColorBrandPrimary } from "@superbase/tokens/native";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "size" | "color"> {
  size?: SpinnerSize;
  color?: string;
}

const sizeFor: Record<SpinnerSize, ActivityIndicatorProps["size"]> = {
  sm: "small",
  md: 28,
  lg: "large",
};

export function Spinner({ size = "md", color = ColorBrandPrimary, ...rest }: SpinnerProps) {
  return (
    <ActivityIndicator size={sizeFor[size]} color={color} accessibilityLabel="로딩 중" {...rest} />
  );
}
