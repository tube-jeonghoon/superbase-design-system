import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("shows initials from name when no src", () => {
    render(<Avatar name="Jeong Hoon" />);
    expect(screen.getByText("JH")).toBeInTheDocument();
  });

  it("renders an image when src is given", () => {
    const { container } = render(<Avatar src="/a.png" name="A" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/a.png");
  });

  it("falls back to a user icon with no src and no name", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
