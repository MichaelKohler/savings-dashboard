import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ActionFunctionArgs } from "react-router";

import { action } from "../../../app/routes/accounts.$accountId.delete";

// Mock dependencies
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/accounts.server", () => ({
  deleteAccount: vi.fn(),
}));

const { requireUserId } = vi.mocked(await import("~/session.server"));
const { deleteAccount } = vi.mocked(await import("~/models/accounts.server"));

describe("routes/accounts.$accountId.delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("action", () => {
    it("should delete account and redirect to accounts page", async () => {
      requireUserId.mockResolvedValue("user-id");
      deleteAccount.mockResolvedValue({ count: 1 });

      const request = new Request(
        "http://localhost/accounts/account-1/delete",
        {
          method: "POST",
        }
      );

      try {
        await action({
          request,
          params: { accountId: "account-1" },
          context: {},
        } as ActionFunctionArgs);
      } catch (response) {
        const res = response as Response;
        expect(res.status).toBe(302);
        expect(res.headers.get("Location")).toBe("/accounts");
      }

      expect(requireUserId).toHaveBeenCalledWith(request);
      expect(deleteAccount).toHaveBeenCalledWith({
        id: "account-1",
        userId: "user-id",
      });
    });

    it("should throw error if user is not authenticated", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request(
        "http://localhost/accounts/account-1/delete",
        {
          method: "POST",
        }
      );

      await expect(
        action({
          request,
          params: { accountId: "account-1" },
          context: {},
        } as ActionFunctionArgs)
      ).rejects.toThrow("Unauthorized");

      expect(deleteAccount).not.toHaveBeenCalled();
    });

    it("should throw error if accountId is missing", async () => {
      requireUserId.mockResolvedValue("user-id");

      const request = new Request("http://localhost/accounts/delete", {
        method: "POST",
      });

      await expect(
        action({
          request,
          params: {},
          context: {},
        } as ActionFunctionArgs)
      ).rejects.toThrow("accountId not found");

      expect(deleteAccount).not.toHaveBeenCalled();
    });

    it("should handle undefined accountId param", async () => {
      requireUserId.mockResolvedValue("user-id");

      const request = new Request("http://localhost/accounts/delete", {
        method: "POST",
      });

      await expect(
        action({
          request,
          params: { accountId: undefined },
          context: {},
        } as ActionFunctionArgs)
      ).rejects.toThrow("accountId not found");

      expect(deleteAccount).not.toHaveBeenCalled();
    });

    it("should handle empty string accountId", async () => {
      requireUserId.mockResolvedValue("user-id");

      const request = new Request("http://localhost/accounts/delete", {
        method: "POST",
      });

      await expect(
        action({
          request,
          params: { accountId: "" },
          context: {},
        } as ActionFunctionArgs)
      ).rejects.toThrow("accountId not found");

      expect(deleteAccount).not.toHaveBeenCalled();
    });
  });
});
