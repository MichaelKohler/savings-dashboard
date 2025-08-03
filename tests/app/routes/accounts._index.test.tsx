import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs } from "react-router";

import AccountsPage, { loader } from "../../../app/routes/accounts._index";

// Mock dependencies
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/accounts.server", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("~/components/button", () => ({
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Form: ({
    children,
    action,
    method,
    ...props
  }: {
    children: React.ReactNode;
    action?: string;
    method?: string;
    [key: string]: unknown;
  }) => (
    <form action={action} method={method} {...props}>
      {children}
    </form>
  ),
  useLoaderData: vi.fn(),
}));

vi.mock("~/components/swatch", () => ({
  default: ({ color }: { color: string }) => (
    <div data-testid="swatch" style={{ backgroundColor: color }}></div>
  ),
}));

const { requireUserId } = vi.mocked(await import("~/session.server"));
const { getAccounts } = vi.mocked(await import("~/models/accounts.server"));
const { useLoaderData } = vi.mocked(await import("react-router"));

const mockAccounts = [
  {
    id: "1",
    name: "Checking Account",
    color: "#ff0000",
    archived: false,
    showInGraphs: true,
    userId: "user-id",
    groupId: "group-1",
    typeId: "type-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    group: {
      id: "group-1",
      name: "Bank Accounts",
      userId: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    type: {
      id: "type-1",
      name: "Checking",
      userId: "user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: "2",
    name: "Savings Account",
    color: "#00ff00",
    archived: true,
    showInGraphs: false,
    userId: "user-id",
    groupId: null,
    typeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    group: null,
    type: null,
  },
];

describe("routes/accounts._index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return accounts for authenticated user", async () => {
      requireUserId.mockResolvedValue("user-id");
      getAccounts.mockResolvedValue(mockAccounts);

      const request = new Request("http://localhost/accounts");
      const result = await loader({ request } as LoaderFunctionArgs);

      expect(requireUserId).toHaveBeenCalledWith(request);
      expect(getAccounts).toHaveBeenCalledWith({ userId: "user-id" });
      expect(result).toEqual({ accounts: mockAccounts });
    });

    it("should throw error if user is not authenticated", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request("http://localhost/accounts");

      await expect(loader({ request } as LoaderFunctionArgs)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("component", () => {
    it("should render accounts list with new account button", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      expect(screen.getByText("+ New Account")).toBeInTheDocument();
      expect(
        screen.getByText("Checking Account (Bank Accounts)")
      ).toBeInTheDocument();
      expect(screen.getByText("Checking")).toBeInTheDocument();
      expect(screen.getByText("Savings Account")).toBeInTheDocument();
    });

    it("should render archived accounts with gray text", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      const savingsRow = screen.getByText("Savings Account").closest("tr");
      expect(savingsRow).toHaveClass("text-gray-300");
    });

    it("should render swatches with correct colors", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      const swatches = screen.getAllByTestId("swatch");
      expect(swatches[0]).toHaveStyle({ backgroundColor: "#ff0000" });
      expect(swatches[1]).toHaveStyle({ backgroundColor: "#00ff00" });
    });

    it("should render edit links for accounts", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      const editLinks = screen.getAllByText("Edit");
      expect(editLinks).toHaveLength(2);
      expect(editLinks[0].closest("a")).toHaveAttribute(
        "href",
        "/accounts/1/edit"
      );
      expect(editLinks[1].closest("a")).toHaveAttribute(
        "href",
        "/accounts/2/edit"
      );
    });

    it("should render delete buttons for accounts", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      const deleteButtons = screen.getAllByText("X");
      expect(deleteButtons).toHaveLength(2);
    });

    it("should render table headers correctly", async () => {
      useLoaderData.mockReturnValue({ accounts: mockAccounts });

      render(<AccountsPage />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should handle empty accounts list", async () => {
      useLoaderData.mockReturnValue({ accounts: [] });

      render(<AccountsPage />);

      expect(screen.getByText("+ New Account")).toBeInTheDocument();
      expect(screen.queryByText("Checking Account")).not.toBeInTheDocument();
    });
  });
});
