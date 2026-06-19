import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner (RN)", () => {
  it("renders with an accessible label", () => {
    render(<Spinner accessibilityLabel="불러오는 중" />);
    expect(screen.getByLabelText("불러오는 중")).toBeInTheDocument();
  });
});
