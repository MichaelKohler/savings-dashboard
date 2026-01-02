import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Swatch from "~/components/swatch";

describe("Swatch", () => {
  it("renders a button element", () => {
    render(<Swatch color="#ff0000" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies the correct background color", () => {
    const color = "#ff0000";
    render(<Swatch color={color} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: color });
  });

  it("applies CSS classes correctly", () => {
    render(<Swatch color="#00ff00" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("rounded");
    expect(button).toHaveClass("py-4");
    expect(button).toHaveClass("px-4");
  });

  it("has pointer events disabled", () => {
    render(<Swatch color="#0000ff" />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ pointerEvents: "none" });
  });

  it("works with different color formats", () => {
    const { rerender } = render(<Swatch color="red" />);
    let button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "red" });

    rerender(<Swatch color="rgb(255, 0, 0)" />);
    button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });

    rerender(<Swatch color="rgba(255, 0, 0, 0.5)" />);
    button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "rgba(255, 0, 0, 0.5)" });
  });

  it("handles empty color", () => {
    render(<Swatch color="" />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "" });
  });

  it("is not interactive due to pointer-events: none", () => {
    render(<Swatch color="#ff00ff" />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ pointerEvents: "none" });
  });
});
