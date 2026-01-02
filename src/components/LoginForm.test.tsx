import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import LoginForm from "~/components/LoginForm";
import { actions, isInputError } from "astro:actions";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.login).mockResolvedValue({
      data: { success: true, redirect: "/" },
      error: undefined,
    });
    vi.mocked(isInputError).mockReturnValue(false);
    delete (window as { location?: { href?: string } }).location;
    (window as { location?: { href?: string } }).location = { href: "" };
  });

  it("renders email input field", () => {
    render(<LoginForm redirectTo="/" />);
    expect(screen.getByLabelText(/Email address/)).toBeInTheDocument();
  });

  it("renders password input field", () => {
    render(<LoginForm redirectTo="/" />);
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
  });

  it("renders remember me checkbox", () => {
    render(<LoginForm redirectTo="/" />);
    expect(screen.getByLabelText(/Remember me/)).toBeInTheDocument();
  });

  it("renders log in button", () => {
    render(<LoginForm redirectTo="/" />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("has required attribute on email input", () => {
    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    expect(emailInput).toHaveAttribute("required");
  });

  it("sets email input type to email", () => {
    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("sets password input type to password", () => {
    render(<LoginForm redirectTo="/" />);
    const passwordInput = screen.getByLabelText(/Password/);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("has autocomplete attributes on inputs", () => {
    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    const passwordInput = screen.getByLabelText(/Password/);
    expect(emailInput).toHaveAttribute("autoComplete", "email");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });

  it("includes hidden redirectTo input with correct value", () => {
    render(<LoginForm redirectTo="/dashboard" />);
    const hiddenInput = document.querySelector('input[name="redirectTo"]');
    expect(hiddenInput).toHaveAttribute("value", "/dashboard");
  });

  it("disables submit button when submitting", async () => {
    vi.mocked(actions.login).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("shows 'Logging in...' text when submitting", async () => {
    vi.mocked(actions.login).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Logging in...")).toBeInTheDocument();
    });
  });

  it("calls login action on form submission", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      data: { success: true, redirect: "/dashboard" },
      error: undefined,
    });

    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    const passwordInput = screen.getByLabelText(/Password/);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actions.login).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("redirects to URL from action response on successful login", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      data: { success: true, redirect: "/dashboard" },
      error: undefined,
    });

    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    const passwordInput = screen.getByLabelText(/Password/);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("redirects to redirectTo prop when action response has no redirect", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      data: { success: true, redirect: "" },
      error: undefined,
    });

    render(<LoginForm redirectTo="/accounts" />);
    const emailInput = screen.getByLabelText(/Email address/);
    const passwordInput = screen.getByLabelText(/Password/);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/accounts");
    });
  });

  it("displays email error when returned from action", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { email: "Invalid email" } } as any,
    });

    render(<LoginForm redirectTo="/" />);
    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("displays password error when returned from action", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { password: "Invalid password" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });
  });

  it("displays generic error on action error", async () => {
    vi.mocked(isInputError).mockReturnValue(false);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { message: "An error occurred. Please try again." } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("focuses email input when email error occurs", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { email: "Invalid email" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(emailInput);
    });
  });

  it("focuses password input when password error occurs", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { password: "Invalid password" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    const passwordInput = screen.getByLabelText(/Password/);
    await waitFor(() => {
      expect(document.activeElement).toBe(passwordInput);
    });
  });

  it("sets correct aria attributes when email error exists", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { email: "Invalid email" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
    });
  });

  it("sets correct aria attributes when password error exists", async () => {
    vi.mocked(isInputError).mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { password: "Invalid password" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    const passwordInput = screen.getByLabelText(/Password/);
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("aria-invalid", "true");
      expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        "password-error"
      );
    });
  });

  it("clears errors on new submission", async () => {
    vi.mocked(isInputError)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    vi.mocked(actions.login)
      .mockResolvedValueOnce({
        data: undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: { fields: { email: "Invalid email" } } as any,
      })
      .mockResolvedValueOnce({
        data: { success: true, redirect: "/" },
        error: undefined,
      });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: "valid@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
    });
  });

  it("re-enables submit button after error", async () => {
    vi.mocked(isInputError).mockReset().mockReturnValue(true);
    vi.mocked(actions.login).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: { fields: { email: "Invalid email" } } as any,
    });

    render(<LoginForm redirectTo="/" />);

    const emailInput = screen.getByLabelText(/Email address/);
    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });

    const submitButton = screen.getByRole("button", { name: "Log in" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    expect(submitButton).toBeEnabled();
  });
});
