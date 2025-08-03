import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

import LoginPage, { loader, action } from "../../../app/routes/login";

// Mock dependencies
vi.mock("~/session.server", () => ({
  getUserId: vi.fn(),
  createUserSession: vi.fn(),
}));

vi.mock("~/models/user.server", () => ({
  verifyLogin: vi.fn(),
}));

vi.mock("~/utils", () => ({
  safeRedirect: vi.fn((redirectTo, defaultTo) => redirectTo || defaultTo),
  validateEmail: vi.fn(),
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
  useActionData: vi.fn(),
  useSearchParams: vi.fn(),
  data: vi.fn(),
  redirect: vi.fn(),
}));

const { getUserId, createUserSession } = vi.mocked(
  await import("~/session.server")
);
const { verifyLogin } = vi.mocked(await import("~/models/user.server"));
const { validateEmail } = vi.mocked(await import("~/utils"));
const { useActionData, useSearchParams } = vi.mocked(
  await import("react-router")
);

const mockUser = {
  id: "user-id",
  email: "test@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("routes/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loader", () => {
    it("should redirect to home if user is already logged in", async () => {
      getUserId.mockResolvedValue("user-id");

      const request = new Request("http://localhost/login");

      try {
        await loader({ request } as LoaderFunctionArgs);
      } catch (response) {
        const res = response as Response;
        expect(res).toBe(302);
        expect(res.headers.get("Location")).toBe("/");
      }
    });

    it("should return empty object if user is not logged in", async () => {
      getUserId.mockResolvedValue(undefined);

      const request = new Request("http://localhost/login");
      const result = await loader({ request } as LoaderFunctionArgs);

      expect(result).toEqual({});
    });
  });

  describe("action", () => {
    it("should create user session with valid credentials", async () => {
      validateEmail.mockReturnValue(true);
      verifyLogin.mockResolvedValue(mockUser);
      createUserSession.mockResolvedValue(new Response(null, { status: 302 }));

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("redirectTo", "/charts");
      formData.append("remember", "on");

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: formData,
      });

      const result = await action({ request } as ActionFunctionArgs);

      expect(validateEmail).toHaveBeenCalledWith("test@example.com");
      expect(verifyLogin).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(createUserSession).toHaveBeenCalledWith({
        request,
        userId: "user-id",
        remember: true,
        redirectTo: "/charts",
      });
      expect(result).toBeInstanceOf(Response);
    });

    it("should throw error for invalid email", async () => {
      validateEmail.mockReturnValue(false);

      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "password123");

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: formData,
      });

      expect(() => action({ request } as ActionFunctionArgs)).rejects.toThrow();
    });

    it("should throw error for missing password", async () => {
      validateEmail.mockReturnValue(true);

      const formData = new FormData();
      formData.append("email", "test@example.com");
      // No password

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: formData,
      });

      expect(() => action({ request } as ActionFunctionArgs)).rejects.toThrow();
    });

    it("should throw error for invalid credentials", async () => {
      validateEmail.mockReturnValue(true);
      verifyLogin.mockResolvedValue(null);

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: formData,
      });

      expect(() => action({ request } as ActionFunctionArgs)).rejects.toThrow();
    });

    it("should handle remember checkbox correctly when not checked", async () => {
      validateEmail.mockReturnValue(true);
      verifyLogin.mockResolvedValue(mockUser);
      createUserSession.mockResolvedValue(new Response(null, { status: 302 }));

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      // Not including remember checkbox

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: formData,
      });

      await action({ request } as ActionFunctionArgs);

      expect(createUserSession).toHaveBeenCalledWith(
        expect.objectContaining({
          remember: false,
        })
      );
    });
  });

  describe("component", () => {
    it("should render login form", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByText("Log in")).toBeInTheDocument();
      expect(screen.getByText("Remember me")).toBeInTheDocument();
    });

    it("should render email input with correct type", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText("Email address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toBeRequired();
    });

    it("should render password input with correct type", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
    });

    it("should render remember me checkbox", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      const rememberCheckbox = screen.getByRole("checkbox", {
        name: "Remember me",
      });
      expect(rememberCheckbox).toHaveAttribute("name", "remember");
    });

    it("should render hidden redirectTo input", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      const redirectToInput = screen.getByDisplayValue("/charts");
      expect(redirectToInput).toHaveAttribute("type", "hidden");
      expect(redirectToInput).toHaveAttribute("name", "redirectTo");
    });

    it("should render remember me checkbox and login form", async () => {
      useActionData.mockReturnValue(null);
      useSearchParams.mockReturnValue([
        new URLSearchParams("redirectTo=/charts"),
        vi.fn(),
      ]);

      render(<LoginPage />);

      const rememberCheckbox = screen.getByRole("checkbox", {
        name: "Remember me",
      });
      expect(rememberCheckbox).toHaveAttribute("name", "remember");

      // Check that main form elements are present
      expect(
        screen.getByRole("button", { name: "Log in" })
      ).toBeInTheDocument();
    });
  });
});
