import { render, screen, fireEvent, act } from "@testing-library/react";
import { Pressable, Text } from "react-native";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";

function Harness() {
  const t = useToast();
  return (
    <>
      <Pressable onPress={() => t.show({ title: "기본" })}><Text>show</Text></Pressable>
      <Pressable onPress={() => t.error("실패함")}><Text>error</Text></Pressable>
      <Pressable onPress={() => t.show({ title: "고정", duration: 0 })}><Text>sticky</Text></Pressable>
    </>
  );
}

function setup() {
  return render(<ToastProvider><Harness /></ToastProvider>);
}

describe("ToastProvider (RN)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("show renders a toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
  });

  it("error renders an assertive toast", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("error")); });
    expect(screen.getByText("실패함")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("auto-dismisses after duration + exit motion", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("show")); });
    expect(screen.getByText("기본")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); });
    act(() => { vi.advanceTimersByTime(120); });
    expect(screen.queryByText("기본")).toBeNull();
  });

  it("duration 0 stays sticky", () => {
    setup();
    act(() => { fireEvent.click(screen.getByText("sticky")); });
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.getByText("고정")).toBeInTheDocument();
  });
});
