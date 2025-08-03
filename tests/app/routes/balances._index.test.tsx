import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs } from "react-router";

import BalancesPage, { loader } from "../../../app/routes/balances._index";

// Mock dependencies
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/balances.server", () => ({
  getBalances: vi.fn(),
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

const { requireUserId } = vi.mocked(await import("~/session.server"));
const { getBalances } = vi.mocked(await import("~/models/balances.server"));
const { useLoaderData } = vi.mocked(await import("react-router"));

const mockBalances = [
  {
    id: "1",
    date: new Date("2023-01-15"),
    balance: 1000,
    accountId: "account-1",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    account: {
      id: "account-1",
      name: "Checking Account",
      color: "#ff0000",
      archived: false,
      showInGraphs: true,
      userId: "user-id",
      groupId: "group-1",
      typeId: "type-1",
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
  },
  {
    id: "2",
    date: new Date("2023-02-15"),
    balance: 1500,
    accountId: "account-2",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    account: {
      id: "account-2",
      name: "Savings Account",
      color: "#00ff00",
      archived: false,
      showInGraphs: true,
      userId: "user-id",
      groupId: null,
      typeId: null,
      group: null,
      type: null,
    },
  },
];

describe("routes/balances._index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return balances for authenticated user", async () => {
      requireUserId.mockResolvedValue("user-id");
      getBalances.mockResolvedValue(mockBalances);

      const request = new Request("http://localhost/balances");
      const result = await loader({ request } as LoaderFunctionArgs);

      expect(requireUserId).toHaveBeenCalledWith(request);
      expect(getBalances).toHaveBeenCalledWith({ userId: "user-id" });
      expect(result).toEqual({ balances: mockBalances });
    });

    it("should throw error if user is not authenticated", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request("http://localhost/balances");

      await expect(loader({ request } as LoaderFunctionArgs)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("component", () => {
    it("should render balances list with new balance button", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      expect(screen.getByText("+ New Balance")).toBeInTheDocument();
      expect(screen.getByText("Checking Account")).toBeInTheDocument();
      expect(screen.getByText("Bank Accounts")).toBeInTheDocument();
      expect(screen.getByText("Savings Account")).toBeInTheDocument();
    });

    it("should render balance amounts correctly", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      expect(screen.getByText("1000")).toBeInTheDocument();
      expect(screen.getByText("1500")).toBeInTheDocument();
    });

    it("should render formatted dates correctly", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      expect(screen.getByText("2023-01-15")).toBeInTheDocument();
      expect(screen.getByText("2023-02-15")).toBeInTheDocument();
    });

    it("should render edit links for balances", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      const editLinks = screen.getAllByText("Edit");
      expect(editLinks).toHaveLength(2);
      expect(editLinks[0].closest("a")).toHaveAttribute(
        "href",
        "/balances/1/edit"
      );
      expect(editLinks[1].closest("a")).toHaveAttribute(
        "href",
        "/balances/2/edit"
      );
    });

    it("should render delete buttons for balances", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      const deleteButtons = screen.getAllByText("X");
      expect(deleteButtons).toHaveLength(2);
    });

    it("should render table headers correctly", async () => {
      useLoaderData.mockReturnValue({ balances: mockBalances });

      render(<BalancesPage />);

      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByText("Balance")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should handle empty balances list", async () => {
      useLoaderData.mockReturnValue({ balances: [] });

      render(<BalancesPage />);

      expect(screen.getByText("+ New Balance")).toBeInTheDocument();
      expect(screen.queryByText("Checking Account")).not.toBeInTheDocument();
    });

    it("should show group name when available", async () => {
      useLoaderData.mockReturnValue({ balances: [mockBalances[0]] });

      render(<BalancesPage />);

      expect(screen.getByText("Bank Accounts")).toBeInTheDocument();
    });

    it("should not show group name when not available", async () => {
      useLoaderData.mockReturnValue({ balances: [mockBalances[1]] });

      render(<BalancesPage />);

      expect(screen.queryByText("Bank Accounts")).not.toBeInTheDocument();
    });
  });
});
