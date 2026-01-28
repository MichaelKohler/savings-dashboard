import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Header from "~/components/header";

vi.mock("astro:actions", () => ({
  actions: {
    logout: vi.fn(),
  },
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
    const link = screen.getByRole("heading").querySelector("a");
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

  it("has correct heading styling", () => {
    render(<Header />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-xl");
  });

  it("shows login link when user is not logged in", () => {
    render(<Header user={null} />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows navigation links when user is logged in", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<Header user={user} />);

    expect(screen.getByRole("link", { name: /accounts/i })).toHaveAttribute(
      "href",
      "/accounts"
    );
    expect(screen.getByRole("link", { name: /groups/i })).toHaveAttribute(
      "href",
      "/groups"
    );
    expect(screen.getByRole("link", { name: /types/i })).toHaveAttribute(
      "href",
      "/types"
    );
    expect(screen.getByRole("link", { name: /balances/i })).toHaveAttribute(
      "href",
      "/balances"
    );
    expect(screen.getByRole("link", { name: /charts/i })).toHaveAttribute(
      "href",
      "/charts"
    );
  });

  it("shows logout button when user is logged in", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<Header user={user} />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("does not show user navigation when not logged in", () => {
    render(<Header user={null} />);

    expect(
      screen.queryByRole("link", { name: /accounts/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /groups/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /types/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /balances/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /charts/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /logout/i })
    ).not.toBeInTheDocument();
  });

  it("does not show login link when user is logged in", () => {
    const user = {
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<Header user={user} />);

    expect(
      screen.queryByRole("link", { name: /log in/i })
    ).not.toBeInTheDocument();
  });

  it("renders mobile menu toggle button", () => {
    render(<Header />);
    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it("toggles menu when clicking the toggle button", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle navigation/i,
    });

    expect(toggleButton).toHaveTextContent("☰");

    await user.click(toggleButton);

    expect(toggleButton).toHaveTextContent("✕");
  });
});
