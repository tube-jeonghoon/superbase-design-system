import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card (RN)", () => {
  it("renders children", () => {
    render(<Card><span>Body</span></Card>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<unknown>();
    render(<Card ref={ref as never}><span>x</span></Card>);
    expect(ref.current).not.toBeNull();
  });
});
