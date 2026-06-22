import { forwardRef, type ElementRef, type ReactNode } from "react";
import { Modal as RNModal, Pressable, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { ModalContext } from "./ModalContext";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
  "aria-label"?: string;
}

export const Modal = forwardRef<ElementRef<typeof View>, ModalProps>(function Modal(
  { open, onClose, size = "md", closeOnBackdropClick = true, closeOnEscape = true, children, "aria-label": ariaLabel },
  ref,
) {
  const t = useTheme();
  const maxWidth = t.size.modal[size];

  return (
    <RNModal
      transparent
      visible={open}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => closeOnEscape && onClose()}
    >
      <Pressable
        testID="modal-scrim"
        onPress={() => closeOnBackdropClick && onClose()}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: t.spacing["4"],
          backgroundColor: t.color.background.scrim,
        }}
      >
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth }}>
          <View
            ref={ref}
            accessibilityViewIsModal
            accessibilityLabel={ariaLabel}
            style={{
              backgroundColor: t.color.background.default,
              borderRadius: t.radius.lg,
              ...t.shadow.lg,
            }}
          >
            <ModalContext.Provider value={{ onClose }}>{children}</ModalContext.Provider>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
});
