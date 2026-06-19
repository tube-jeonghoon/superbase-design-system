import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { RadioContext } from "./RadioContext";
import { Spacing2 } from "@superbase/tokens/native";

export interface RadioGroupProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}

export function RadioGroup({ value, onChange, children, style, ...rest }: RadioGroupProps) {
  return (
    <View style={[{ gap: Spacing2 }, style]} {...rest}>
      <RadioContext.Provider value={{ value, onChange }}>{children}</RadioContext.Provider>
    </View>
  );
}
