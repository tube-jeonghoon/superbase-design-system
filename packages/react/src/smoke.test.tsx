import { render, screen } from "@testing-library/react";

describe("test harness", () => {
  it("renders and matches with jest-dom", () => {
    render(<div>harness-ok</div>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
