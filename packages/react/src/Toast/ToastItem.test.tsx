import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";
import type { ToastData } from "./types";

function makeToast(over: Partial<ToastData> = {}): ToastData {
  return { id: "t1", title: "제목", variant: "info", duration: 4000, status: "visible", ...over };
}

describe("Toast item", () => {
  it("renders title and description", () => {
    render(<Toast toast={makeToast({ description: "설명" })} onDismiss={() => {}} />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("설명")).toBeInTheDocument();
  });

  it("uses role=status for non-danger and role=alert for danger", () => {
    const { rerender } = render(<Toast toast={makeToast()} onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<Toast toast={makeToast({ variant: "danger" })} onDismiss={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("close button calls onDismiss with id", () => {
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast()} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("action button fires action then dismisses", () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast toast={makeToast({ action: { label: "실행취소", onClick } })} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "실행취소" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("exposes data-variant and data-state", () => {
    const { container } = render(<Toast toast={makeToast({ variant: "success", status: "exiting" })} onDismiss={() => {}} />);
    const el = container.querySelector('[data-variant="success"]');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute("data-state", "exiting");
  });
});
