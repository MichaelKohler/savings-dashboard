import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoaderFunctionArgs } from "react-router";

import { loader } from "./healthcheck";

// Mock dependencies
vi.mock("~/db.server", () => ({
  prisma: {
    user: {
      count: vi.fn(),
    },
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const { prisma } = vi.mocked(await import("~/db.server"));

describe("routes/healthcheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should return OK when database and self-check succeed", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const request = new Request("http://localhost/healthcheck", {
        headers: {
          host: "localhost",
        },
      });

      const response = await loader({ request } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("OK");
      expect(prisma.user.count).toHaveBeenCalled();
    });

    it("should use X-Forwarded-Host header when available", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const request = new Request("http://localhost/healthcheck", {
        headers: {
          "X-Forwarded-Host": "example.com",
          host: "localhost",
        },
      });

      await loader({ request } as LoaderFunctionArgs);

      expect(mockFetch).toHaveBeenCalledWith("http://example.com", {
        method: "HEAD",
      });
    });

    it("should return ERROR when database query fails", async () => {
      vi.mocked(prisma.user.count).mockRejectedValue(
        new Error("Database error")
      );
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const request = new Request("http://localhost/healthcheck", {
        headers: {
          host: "localhost",
        },
      });

      const response = await loader({ request } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
      expect(await response.text()).toBe("ERROR");
    });

    it("should return ERROR when self-check fails", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      mockFetch.mockResolvedValue({
        ok: false,
      });

      const request = new Request("http://localhost/healthcheck", {
        headers: {
          host: "localhost",
        },
      });

      const response = await loader({ request } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
      expect(await response.text()).toBe("ERROR");
    });

    it("should return ERROR when fetch throws", async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      mockFetch.mockRejectedValue(new Error("Network error"));

      const request = new Request("http://localhost/healthcheck", {
        headers: {
          host: "localhost",
        },
      });

      const response = await loader({ request } as LoaderFunctionArgs);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
      expect(await response.text()).toBe("ERROR");
    });
  });
});
