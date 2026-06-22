import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";
import type { ToastData } from "./types";

function makeToast(over: Partial<ToastData> = {}): ToastData {
  return { id: "t1", title: "제목", variant: "info", duration: 4000, status: "visible", ...over };
}

describe("Toast item (RN)", () => {
  it("renders title and description", () => {
    render(<Toast toast={makeToast({ description: "설명" })} onDismiss={() => {}} />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("danger uses role alert, others status", () => {
    const { rerender } = render(<Toast toast={makeToast()} onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Toast toast={makeToast({ variant: "danger" })} onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("close button calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("action fires onPress then dismisses", () => {
    const onPress = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast({ action: { label: "실행취소", onPress } })} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText("실행취소"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });
});
