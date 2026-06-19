import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SideNav } from "./SideNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/components/button" }));

describe("SideNav", () => {
  it("lists all 9 component links", () => {
    render(<SideNav />);
    for (const label of [
      "Badge", "Button", "Checkbox", "Radio", "Spinner",
      "Stack", "Switch", "Text", "TextField",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current component link active", () => {
    render(<SideNav />);
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "data-active",
      "true",
    );
  });
});
