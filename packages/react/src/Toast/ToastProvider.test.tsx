import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";

function Harness() {
  const t = useToast();
  return (
    <div>
      <button onClick={() => t.show({ title: "기본" })}>show</button>
      <button onClick={() => t.error("실패함")}>error</button>
      <button onClick={() => t.show({ title: "고정", duration: 0 })}>sticky</button>
    </div>
  );
}

function setup() {
  return render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );
}

describe("ToastProvider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("show renders a toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("error renders an assertive toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("실패함")).toBeInTheDocument();
  });

  it("auto-dismisses after duration + exit motion", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(120); });
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("duration 0 stays sticky", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("sticky")); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText("고정")).toBeInTheDocument();
  });

  it("dismiss via close button removes the toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "Close" })); });
    act(() => { vi.advanceTimersByTime(120); });
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("stacks multiple toasts", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    expect(screen.getByText("실패함")).toBeInTheDocument();
  });
});
