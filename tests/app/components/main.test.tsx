import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import Sidebar from "~/components/main";
import { useOptionalUser } from "~/utils";

// Mock react-router components
vi.mock("react-router", () => ({
  Form: ({
    action,
    method,
    children,
  }: {
    action: string;
    method: string;
    children: React.ReactNode;
  }) => (
    <form action={action} method={method}>
      {children}
    </form>
  ),
  NavLink: ({
    to,
    className,
    children,
  }: {
    to: string;
    className: string;
    children: React.ReactNode;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet">Outlet content</div>,
}));

// Mock useOptionalUser hook
vi.mock("~/utils", () => ({
  useOptionalUser: vi.fn(),
}));

const mockUseOptionalUser = vi.mocked(useOptionalUser);

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main container with correct styling", () => {
    mockUseOptionalUser.mockReturnValue(undefined);

    render(<Sidebar />);

    const container = document.querySelector("div.bg-white");
    expect(container).toHaveClass("bg-white");
    expect(container).toHaveClass("flex");
    expect(container).toHaveClass("flex-col");
    expect(container).toHaveClass("h-screen");
    expect(container).toHaveClass("relative");
  });

  it("renders the Outlet component", () => {
    mockUseOptionalUser.mockReturnValue(undefined);

    render(<Sidebar />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("shows login link when user is not logged in", () => {
    mockUseOptionalUser.mockReturnValue(undefined);

    render(<Sidebar />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
    expect(screen.getByText("🔐")).toBeInTheDocument();
  });

  it("shows navigation links when user is logged in", () => {
    mockUseOptionalUser.mockReturnValue({
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<Sidebar />);

    // Check all navigation links
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

    // Check emojis
    expect(screen.getByText("📒")).toBeInTheDocument();
    expect(screen.getByText("🫙")).toBeInTheDocument();
    expect(screen.getByText("🏦")).toBeInTheDocument();
    expect(screen.getByText("💰")).toBeInTheDocument();
    expect(screen.getByText("📈")).toBeInTheDocument();
  });

  it("shows logout button when user is logged in", () => {
    mockUseOptionalUser.mockReturnValue({
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<Sidebar />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute("type", "submit");
    expect(screen.getByText("🔓")).toBeInTheDocument();

    // Check the form
    const form = logoutButton.closest("form");
    expect(form).toHaveAttribute("action", "/logout");
    expect(form).toHaveAttribute("method", "post");
  });

  it("does not show user navigation when not logged in", () => {
    mockUseOptionalUser.mockReturnValue(undefined);

    render(<Sidebar />);

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
    mockUseOptionalUser.mockReturnValue({
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<Sidebar />);

    expect(
      screen.queryByRole("link", { name: /login/i })
    ).not.toBeInTheDocument();
  });

  it("applies correct CSS classes to navigation links", () => {
    mockUseOptionalUser.mockReturnValue({
      id: "1",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    render(<Sidebar />);

    const accountsLink = screen.getByRole("link", { name: /accounts/i });
    expect(accountsLink).toHaveClass("flex");
    expect(accountsLink).toHaveClass("flex-col");
    expect(accountsLink).toHaveClass("justify-center");
    expect(accountsLink).toHaveClass("items-center");
    expect(accountsLink).toHaveClass("py-4");
  });

  it("applies correct styling to the bottom navigation", () => {
    mockUseOptionalUser.mockReturnValue(undefined);

    render(<Sidebar />);

    const navigation = screen.getByRole("list");
    expect(navigation).toHaveClass("sticky");
    expect(navigation).toHaveClass("bottom-0");
    expect(navigation).toHaveClass("bg-white");
    expect(navigation).toHaveClass("w-screen");
    expect(navigation).toHaveClass("flex");
    expect(navigation).toHaveClass("flex-row");
    expect(navigation).toHaveClass("justify-between");
    expect(navigation).toHaveClass("py-4");
    expect(navigation).toHaveClass("px-6");
    expect(navigation).toHaveClass("md:px-12");
    expect(navigation).toHaveClass("border-t");
    expect(navigation).toHaveClass("border-gray-300");
    expect(navigation).toHaveClass("z-50");
  });
});
