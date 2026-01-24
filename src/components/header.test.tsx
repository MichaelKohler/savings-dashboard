import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Header from "~/components/header";

// Mock react-router Link component
vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("Header", () => {
  it("renders the header element", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("applies correct CSS classes to header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("bg-mk");
    expect(header).toHaveClass("p-4");
    expect(header).toHaveClass("text-white");
  });

  it("renders the main title with link to home", () => {
    render(<Header />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("savings.michaelkohler.info");
  });

  it("renders the savings text", () => {
    render(<Header />);
    expect(screen.getByText("savings", { exact: false })).toBeInTheDocument();
  });

  it("renders the domain text with correct styling", () => {
    render(<Header />);
    const domainText = screen.getByText(".michaelkohler.info");
    expect(domainText).toBeInTheDocument();
    expect(domainText).toHaveClass("text-mklight-300");
  });

  it("has correct layout structure", () => {
    render(<Header />);
    const container = screen.getByRole("banner").querySelector("div");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("w-full");
    expect(container).toHaveClass("flex-row");
    expect(container).toHaveClass("justify-between");
  });

  it("has correct heading styling", () => {
    render(<Header />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-3xl");
  });
});
