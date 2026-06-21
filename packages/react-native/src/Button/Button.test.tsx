import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button (RN)", () => {
  it("renders its label", () => {
    render(<Button onPress={() => {}}>Click</Button>);
    expect(screen.getByText("Click")).toBeInTheDocument();
  });

  it("calls onPress when pressed", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Go</Button>);
    fireEvent.click(screen.getByText("Go"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} disabled>
        Go
      </Button>,
    );
    fireEvent.click(screen.getByText("Go"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("blocks onPress and shows a spinner while loading", () => {
    const onPress = vi.fn();
    render(
      <Button onPress={onPress} loading>
        Save
      </Button>,
    );
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders start/end icon slots", () => {
    render(
      <Button onPress={() => {}} startIcon={<span data-testid="s" />} endIcon={<span data-testid="e" />}>
        Go
      </Button>,
    );
    expect(screen.getByTestId("s")).toBeInTheDocument();
    expect(screen.getByTestId("e")).toBeInTheDocument();
  });
});
