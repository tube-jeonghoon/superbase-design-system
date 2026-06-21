import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes a status role with an accessible label", () => {
    render(<Spinner aria-label="불러오는 중" />);
    expect(screen.getByRole("status", { name: "불러오는 중" })).toBeInTheDocument();
  });

  it("defaults size to md (data attribute)", () => {
    render(<Spinner aria-label="x" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "md");
  });

  it("reflects the size prop", () => {
    render(<Spinner size="lg" aria-label="x" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "lg");
  });

  it("forwards ref to the spinner element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
