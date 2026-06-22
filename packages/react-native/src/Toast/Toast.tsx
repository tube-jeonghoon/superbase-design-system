import { useEffect, useRef } from "react";
import { Animated, View, Text as RNText, Pressable, type TextStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import type { ToastData } from "./types";

const VARIANT_ICON = { info: "info", success: "success", warning: "warning", danger: "error" } as const;

export interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastItemProps) {
  const t = useTheme();
  const { id, title, description, variant, action, status } = toast;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: t.motion.duration.base, useNativeDriver: true }).start();
  }, [anim, t.motion.duration.base]);

  useEffect(() => {
    if (status === "exiting") {
      Animated.timing(anim, { toValue: 0, duration: t.motion.duration.fast, useNativeDriver: true }).start();
    }
  }, [status, anim, t.motion.duration.fast]);

  return (
    <Animated.View
      role={variant === "danger" ? "alert" : "status"}
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        flexDirection: "row",
        alignItems: "flex-start",
        gap: t.spacing["3"],
        width: "100%",
        maxWidth: t.size.toast,
        padding: t.spacing["3"],
        backgroundColor: t.color.background.default,
        borderRadius: t.radius.lg,
        ...t.shadow.lg,
      }}
    >
      <View style={{ paddingTop: 2 }}>
        <Icon name={VARIANT_ICON[variant]} size="sm" color={t.color.status[variant]} />
      </View>
      <View style={{ flex: 1 }}>
        <RNText style={{ fontSize: t.font.size.body, fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"], color: t.color.text.primary }}>
          {title}
        </RNText>
        {description ? (
          <RNText style={{ marginTop: t.spacing["1"], fontSize: t.font.size.caption, color: t.color.text.secondary }}>
            {description}
          </RNText>
        ) : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            action.onPress();
            onDismiss(id);
          }}
        >
          <RNText style={{ fontSize: t.font.size.caption, fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"], color: t.color.brand.primary }}>
            {action.label}
          </RNText>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => onDismiss(id)}>
        <Icon name="close" size="sm" color={t.color.text.secondary} />
      </Pressable>
    </Animated.View>
  );
}
