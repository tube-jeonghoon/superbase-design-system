import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar (RN)", () => {
  it("shows initials from name when no src", () => {
    render(<Avatar name="Jeong Hoon" />);
    expect(screen.getByText("JH")).toBeInTheDocument();
  });

  it("falls back to a user icon with no src and no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
