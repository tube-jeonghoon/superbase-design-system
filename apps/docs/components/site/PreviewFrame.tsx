import type { ReactNode } from "react";
import styles from "./PreviewFrame.module.css";

export interface PreviewFrameProps {
  children: ReactNode;
}

/** 카드 전체가 <a>이므로, 미리보기 안의 인터랙티브 요소를 inert로 포인터·탭 순서·접근성 트리에서 제거한다. */
export function PreviewFrame({ children }: PreviewFrameProps) {
  return (
    <div className={styles.frame} inert>
      {children}
    </div>
  );
}
