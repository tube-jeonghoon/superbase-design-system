import { render, screen } from "@testing-library/react";
import { Swatch } from "./Swatch";

describe("Swatch", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--color-test");
  });

  it("renders the token name", () => {
    render(<Swatch name="brand.primary" cssVar="--color-brand-primary" />);
    expect(screen.getByText("brand.primary")).toBeInTheDocument();
  });

  it("renders the resolved hex value, uppercased", () => {
    document.documentElement.style.setProperty("--color-test", "#3182f6");
    render(<Swatch name="test" cssVar="--color-test" />);
    expect(screen.getByText("#3182F6")).toBeInTheDocument();
  });
});
