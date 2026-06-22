import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} onClose={() => {}} aria-label="dlg">body</Modal>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a dialog with aria-modal when open", () => {
    render(<Modal open onClose={() => {}} aria-label="dlg">body</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "dlg");
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg">body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeOnEscape=false", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} closeOnEscape={false} aria-label="dlg">body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on backdrop click but not on panel click", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg">body</Modal>);
    fireEvent.click(screen.getByText("body")); // panel content
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on backdrop click when closeOnBackdropClick=false", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} closeOnBackdropClick={false} aria-label="dlg">body</Modal>);
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("applies size via data-size", () => {
    render(<Modal open onClose={() => {}} size="lg" aria-label="dlg">body</Modal>);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-size", "lg");
  });

  it("forwards ref to the panel", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal open onClose={() => {}} ref={ref} aria-label="dlg">body</Modal>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "dialog");
  });

  // Regression: Portal must mount the panel synchronously so the focus-trap
  // effect finds the node on first open (a deferred Portal left focus untrapped).
  it("moves focus into the panel when opened", () => {
    render(
      <Modal open onClose={() => {}} aria-label="dlg">
        <button>inside</button>
      </Modal>,
    );
    const inside = screen.getByText("inside");
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(inside);
  });
});

describe("Modal compound", () => {
  it("wires the header title to aria-labelledby", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader>제목</ModalHeader>
        <ModalBody>내용</ModalBody>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const labelledby = dialog.getAttribute("aria-labelledby");
    expect(labelledby).toBeTruthy();
    expect(document.getElementById(labelledby!)?.textContent).toBe("제목");
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("renders a close button that calls onClose", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <ModalHeader>제목</ModalHeader>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the close button when showCloseButton=false", () => {
    render(
      <Modal open onClose={() => {}}>
        <ModalHeader showCloseButton={false}>제목</ModalHeader>
      </Modal>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("renders footer content", () => {
    render(
      <Modal open onClose={() => {}} aria-label="dlg">
        <ModalFooter><button>확인</button></ModalFooter>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });
});
