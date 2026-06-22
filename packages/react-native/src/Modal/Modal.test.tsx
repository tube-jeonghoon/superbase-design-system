import { createRef } from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal (RN)", () => {
  it("renders nothing when closed", () => {
    render(<Modal open={false} onClose={() => {}} aria-label="dlg"><Text>body</Text></Modal>);
    expect(screen.queryByText("body")).toBeNull();
  });

  it("renders content when open", () => {
    render(<Modal open onClose={() => {}} aria-label="dlg"><Text>body</Text></Modal>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("calls onClose when the scrim is pressed", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} aria-label="dlg"><Text>body</Text></Modal>);
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on scrim press when closeOnBackdropClick=false", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} closeOnBackdropClick={false} aria-label="dlg"><Text>body</Text></Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = createRef<unknown>();
    render(<Modal open onClose={() => {}} ref={ref as never} aria-label="dlg"><Text>body</Text></Modal>);
    expect(ref.current).not.toBeNull();
  });
});
