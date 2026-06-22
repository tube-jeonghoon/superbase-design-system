import { forwardRef, useState, type ElementRef } from "react";
import { View, Image, Text as RNText, type StyleProp, type ViewStyle, type TextStyle } from "react-native";
import { useTheme } from "../theme/useTheme";
import { Icon } from "../Icon/Icon";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  style?: StyleProp<ViewStyle>;
}

function initials(name?: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const Avatar = forwardRef<ElementRef<typeof View>, AvatarProps>(function Avatar(
  { src, name, size = "md", shape = "circle", style },
  ref,
) {
  const t = useTheme();
  const [failed, setFailed] = useState(false);
  const dim = t.size.avatar[size];
  const radius = shape === "circle" ? t.radius.full : t.radius.md;
  const showImage = !!src && !failed;
  const text = initials(name);
  const fontFor: Record<AvatarSize, number> = {
    sm: t.font.size.caption,
    md: t.font.size.body,
    lg: t.font.size.title,
  };
  return (
    <View
      ref={ref}
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.color.background.subtle,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image source={{ uri: src }} onError={() => setFailed(true)} style={{ width: "100%", height: "100%" }} />
      ) : text ? (
        <RNText
          style={{
            color: t.color.text.secondary,
            fontSize: fontFor[size],
            fontWeight: String(t.font.weight.medium) as TextStyle["fontWeight"],
          }}
        >
          {text}
        </RNText>
      ) : (
        <Icon name="user" size={16} color={t.color.text.secondary} />
      )}
    </View>
  );
});
