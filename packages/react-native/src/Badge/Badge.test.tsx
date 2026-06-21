import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge (RN)", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("accepts variant without error", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders an icon slot", () => {
    render(<Badge icon={<span data-testid="i" />}>X</Badge>);
    expect(screen.getByTestId("i")).toBeInTheDocument();
  });
});
