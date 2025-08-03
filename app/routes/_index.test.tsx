import { describe, it, expect, vi } from "vitest";
import type { LoaderFunctionArgs } from "react-router";

import { loader } from "./_index";

// Mock session.server
vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

const { requireUserId } = vi.mocked(await import("~/session.server"));

describe("routes/_index", () => {
  describe("loader", () => {
    it("should redirect to /accounts", async () => {
      requireUserId.mockResolvedValue("user-id");

      const request = new Request("http://localhost/");

      try {
        await loader({ request } as LoaderFunctionArgs);
      } catch (response) {
        const res = response as Response;
        expect(res.status).toBe(302);
        expect(res.headers.get("Location")).toBe("/accounts");
      }
    });

    it("should require user authentication", async () => {
      const error = new Error("Unauthorized");
      requireUserId.mockRejectedValue(error);

      const request = new Request("http://localhost/");

      await expect(loader({ request } as LoaderFunctionArgs)).rejects.toThrow(
        "Unauthorized"
      );
    });
  });
});
