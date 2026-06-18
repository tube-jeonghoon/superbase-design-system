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
});
