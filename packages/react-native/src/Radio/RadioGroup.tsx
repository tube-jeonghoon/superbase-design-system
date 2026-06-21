import { forwardRef, type ReactNode, type ElementRef } from "react";
import { View, type ViewProps } from "react-native";
import { RadioContext } from "./RadioContext";
import { useTheme } from "../theme/useTheme";

export interface RadioGroupProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export const RadioGroup = forwardRef<ElementRef<typeof View>, RadioGroupProps>(function RadioGroup(
  { value, onChange, children, style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <View ref={ref} style={[{ gap: t.spacing["2"] }, style]} {...rest}>
      <RadioContext.Provider value={{ value, onChange }}>{children}</RadioContext.Provider>
    </View>
  );
});
