import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Button from "~/components/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("renders as submit button when isSubmit is true", () => {
    render(<Button isSubmit>Submit</Button>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
  });

  it("renders as regular button when isSubmit is false", () => {
    render(<Button isSubmit={false}>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("renders as regular button by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies danger styles when isDanger is true", () => {
    render(<Button isDanger>Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("bg-mkerror");
    expect(button).toHaveClass("hover:bg-mkerror-muted");
    expect(button).toHaveClass("active:bg-mkerror-muted");
  });

  it("applies default styles when isDanger is false", () => {
    render(<Button isDanger={false}>Normal</Button>);
    const button = screen.getByRole("button", { name: "Normal" });
    expect(button).toHaveClass("bg-mk");
    expect(button).toHaveClass("hover:bg-mk-tertiary");
    expect(button).toHaveClass("active:bg-mk-tertiary");
    expect(button).toHaveClass("text-white");
  });

  it("applies default styles by default", () => {
    render(<Button>Normal</Button>);
    const button = screen.getByRole("button", { name: "Normal" });
    expect(button).toHaveClass("bg-mk");
    expect(button).toHaveClass("hover:bg-mk-tertiary");
    expect(button).toHaveClass("active:bg-mk-tertiary");
    expect(button).toHaveClass("text-white");
  });

  it("is disabled when isDisabled is true", () => {
    render(<Button isDisabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });

  it("is enabled when isDisabled is false", () => {
    render(<Button isDisabled={false}>Enabled</Button>);
    const button = screen.getByRole("button", { name: "Enabled" });
    expect(button).toBeEnabled();
  });

  it("is enabled by default", () => {
    render(<Button>Enabled</Button>);
    const button = screen.getByRole("button", { name: "Enabled" });
    expect(button).toBeEnabled();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} isDisabled>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button", { name: "Disabled" });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not add onClick handler when onClick is not provided", () => {
    render(<Button>No click handler</Button>);
    const button = screen.getByRole("button", { name: "No click handler" });
    expect(button).not.toHaveAttribute("onclick");
  });

  it("applies common CSS classes", () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole("button", { name: "Test" });
    expect(button).toHaveClass("text-white-100");
    expect(button).toHaveClass("rounded");
    expect(button).toHaveClass("py-2");
    expect(button).toHaveClass("px-4");
    expect(button).toHaveClass("mt-1");
    expect(button).toHaveClass("mb-1");
    expect(button).toHaveClass("transition");
    expect(button).toHaveClass("duration-300");
  });

  it("handles complex children content", () => {
    render(
      <Button>
        <span>Complex</span> content
      </Button>
    );
    expect(screen.getByRole("button")).toHaveTextContent("Complex content");
  });
});
