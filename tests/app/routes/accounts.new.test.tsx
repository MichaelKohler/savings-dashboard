import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

import NewAccountPage, {
  loader,
  action,
} from "../../../app/routes/accounts.new";

// Mock dependencies
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/accounts.server", () => ({
  createAccount: vi.fn(),
}));

vi.mock("~/models/groups.server", () => ({
  getGroups: vi.fn(),
}));

vi.mock("~/models/types.server", () => ({
  getTypes: vi.fn(),
}));

vi.mock("~/components/forms/account", () => ({
  default: ({ groups, types }: { groups: unknown; types: unknown }) => (
    <div data-testid="account-form">
      Account Form - Groups: {JSON.stringify(groups)} - Types:{" "}
      {JSON.stringify(types)}
    </div>
  ),
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
  data: vi.fn(),
  redirect: vi.fn(),
}));

const { requireUserId } = vi.mocked(await import("~/session.server"));
const { createAccount } = vi.mocked(await import("~/models/accounts.server"));
const { getGroups } = vi.mocked(await import("~/models/groups.server"));
const { getTypes } = vi.mocked(await import("~/models/types.server"));
const { useLoaderData } = vi.mocked(await import("react-router"));

const mockGroups = [
  {
    id: "1",
    name: "Bank Accounts",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    accounts: [],
  },
];

const mockTypes = [
  {
    id: "1",
    name: "Checking",
    userId: "user-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    accounts: [],
  },
];

const mockAccount = {
  id: "1",
  name: "Test Account",
  color: "#ff0000",
  showInGraphs: true,
  archived: false,
  userId: "user-id",
  groupId: "group-1",
  typeId: "type-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("routes/accounts.new", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return groups and types for authenticated user", async () => {
      requireUserId.mockResolvedValue("user-id");
      getGroups.mockResolvedValue(mockGroups);
      getTypes.mockResolvedValue(mockTypes);

      const request = new Request("http://localhost/accounts/new");
      const result = await loader({ request } as LoaderFunctionArgs);

      expect(requireUserId).toHaveBeenCalledWith(request);
      expect(getGroups).toHaveBeenCalledWith({ userId: "user-id" });
      expect(getTypes).toHaveBeenCalledWith({ userId: "user-id" });
      expect(result).toEqual({ groups: mockGroups, types: mockTypes });
    });

    it("should throw error if user is not authenticated", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request("http://localhost/accounts/new");

      await expect(loader({ request } as LoaderFunctionArgs)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("action", () => {
    it("should create account with valid data", async () => {
      requireUserId.mockResolvedValue("user-id");
      createAccount.mockResolvedValue(mockAccount);

      const formData = new FormData();
      formData.append("name", "Test Account");
      formData.append("color", "#ff0000");
      formData.append("groupId", "group-1");
      formData.append("typeId", "type-1");
      formData.append("showInGraphs", "on");

      const request = new Request("http://localhost/accounts/new", {
        method: "POST",
        body: formData,
      });

      try {
        await action({ request } as ActionFunctionArgs);
      } catch (response) {
        const res = response as Response;
        expect(res.status).toBe(302);
        expect(res.headers.get("Location")).toBe("/accounts");
      }

      expect(createAccount).toHaveBeenCalledWith(
        {
          name: "Test Account",
          color: "#ff0000",
          showInGraphs: true,
          groupId: "group-1",
          typeId: "type-1",
        },
        "user-id"
      );
    });

    it("should throw error for missing name", async () => {
      requireUserId.mockResolvedValue("user-id");

      const formData = new FormData();
      formData.append("color", "#ff0000");

      const request = new Request("http://localhost/accounts/new", {
        method: "POST",
        body: formData,
      });

      expect(() => action({ request } as ActionFunctionArgs)).rejects.toThrow();
    });

    it("should throw error for missing color", async () => {
      requireUserId.mockResolvedValue("user-id");

      const formData = new FormData();
      formData.append("name", "Test Account");

      const request = new Request("http://localhost/accounts/new", {
        method: "POST",
        body: formData,
      });

      expect(() => action({ request } as ActionFunctionArgs)).rejects.toThrow();
    });
  });

  describe("component", () => {
    it("should render page title and form", async () => {
      useLoaderData.mockReturnValue({ groups: mockGroups, types: mockTypes });

      render(<NewAccountPage />);

      expect(screen.getByText("Add new account")).toBeInTheDocument();
      expect(screen.getByTestId("account-form")).toBeInTheDocument();
    });

    it("should pass groups and types to form component", async () => {
      useLoaderData.mockReturnValue({ groups: mockGroups, types: mockTypes });

      render(<NewAccountPage />);

      const form = screen.getByTestId("account-form");
      expect(form).toHaveTextContent("Bank Accounts");
      expect(form).toHaveTextContent("Checking");
    });

    it("should handle empty groups and types", async () => {
      useLoaderData.mockReturnValue({ groups: [], types: [] });

      render(<NewAccountPage />);

      expect(screen.getByText("Add new account")).toBeInTheDocument();
      expect(screen.getByTestId("account-form")).toBeInTheDocument();
    });
  });
});
