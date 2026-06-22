import { forwardRef, type ElementRef, type ReactNode } from "react";
import { View, type ViewProps, type StyleProp, type ViewStyle } from "react-native";
import { TabsContext } from "./TabsContext";

export interface TabsProps extends ViewProps {
  value: string;
  onChange?: (value: string) => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Tabs = forwardRef<ElementRef<typeof View>, TabsProps>(function Tabs(
  { value, onChange, children, style, ...rest },
  ref,
) {
  return (
    <View ref={ref} style={style} {...rest}>
      <TabsContext.Provider value={{ value, onChange }}>{children}</TabsContext.Provider>
    </View>
  );
});
