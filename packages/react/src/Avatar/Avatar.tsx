import { forwardRef, useState, type HTMLAttributes } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./Avatar.module.css";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
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

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = "md", shape = "circle", className, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;
  const text = initials(name);
  const labelProps = showImage ? {} : ({ role: "img", "aria-label": name || undefined } as const);
  return (
    <span
      ref={ref}
      data-size={size}
      data-shape={shape}
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      {...labelProps}
      {...rest}
    >
      {showImage ? (
        <img className={styles.img} src={src} alt={name ?? ""} onError={() => setFailed(true)} />
      ) : text ? (
        <span className={styles.initials} aria-hidden="true">{text}</span>
      ) : (
        <Icon name="user" size={16} />
      )}
    </span>
  );
});
