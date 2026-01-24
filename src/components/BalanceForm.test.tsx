import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import BalanceForm from "~/components/BalanceForm";
import { actions, isInputError } from "astro:actions";

describe("BalanceForm", () => {
  const mockAccounts = [
    {
      id: "a1",
      name: "Savings Account",
      color: "#FF0000",
      archived: false,
      showInGraphs: true,
      userId: "u1",
      groupId: null,
      typeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "a2",
      name: "Checking Account",
      color: "#00FF00",
      archived: false,
      showInGraphs: true,
      userId: "u1",
      groupId: null,
      typeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockBalance = {
    id: "b1",
    balance: 1000,
    date: new Date("2024-01-15"),
    accountId: "a1",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createBalance).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(actions.updateBalance).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(isInputError).mockReturnValue(false);
    delete (window as { location?: { href?: string } }).location;
    (window as { location?: { href?: string } }).location = { href: "" };
  });

  it("renders form with all fields", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    expect(screen.getByLabelText(/Account:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Balance:/)).toBeInTheDocument();
  });

  it("renders all account options", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    const accountSelect = screen.getByLabelText(
      /Account:/
    ) as HTMLSelectElement;
    expect(accountSelect.querySelectorAll("option")).toHaveLength(3); // including "Select account"
    expect(
      screen.getByRole("option", { name: "Savings Account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Checking Account" })
    ).toBeInTheDocument();
  });

  it("populates form with balance data in edit mode", () => {
    render(<BalanceForm balance={mockBalance} accounts={mockAccounts} />);
    expect(screen.getByDisplayValue("1000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2024-01-15")).toBeInTheDocument();
    const accountSelect = screen.getByLabelText(
      /Account:/
    ) as HTMLSelectElement;
    expect(accountSelect.value).toBe("a1");
  });

  it("renders save button", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("disables save button when submitting", async () => {
    vi.mocked(actions.createBalance).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("shows spinner when submitting", async () => {
    vi.mocked(actions.createBalance).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("calls create API when creating new balance", async () => {
    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.createBalance).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("calls update API when editing existing balance", async () => {
    render(<BalanceForm balance={mockBalance} accounts={mockAccounts} />);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(balanceInput, { target: { value: "1500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.updateBalance).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("redirects to /balances on successful submission", async () => {
    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/balances");
    });
  });

  it("displays balance error when returned from API", async () => {
    const mockError = { fields: { balance: "Balance is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields (API will return error despite valid input)
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } }); // Fill to pass HTML5 validation

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Balance is required")).toBeInTheDocument();
    });
  });

  it("displays date error when returned from API", async () => {
    const mockError = { fields: { date: "Date is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields (API will return error despite valid input)
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } }); // Fill to pass HTML5 validation
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Date is required")).toBeInTheDocument();
    });
  });

  it("displays accountId error when returned from API", async () => {
    const mockError = { fields: { accountId: "Account is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields (API will return error despite valid input)
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } }); // Fill to pass HTML5 validation
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Account is required")).toBeInTheDocument();
    });
  });

  it("displays generic error on network failure", async () => {
    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });
    vi.mocked(isInputError).mockReturnValue(false);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to save balance")).toBeInTheDocument();
    });
  });

  it("focuses balance input when balance error occurs", async () => {
    const mockError = { fields: { balance: "Balance is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(balanceInput);
    });
  });

  it("focuses date input when date error occurs", async () => {
    const mockError = { fields: { date: "Date is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(dateInput);
    });
  });

  it("sets correct aria attributes when balance error exists", async () => {
    const mockError = { fields: { balance: "Balance is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(balanceInput).toHaveAttribute("aria-invalid", "true");
      expect(balanceInput).toHaveAttribute(
        "aria-errormessage",
        "balance-error"
      );
    });
  });

  it("sets correct aria attributes when date error exists", async () => {
    const mockError = { fields: { date: "Date is required" } };

    vi.mocked(actions.createBalance).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(dateInput).toHaveAttribute("aria-invalid", "true");
      expect(dateInput).toHaveAttribute("aria-errormessage", "date-error");
    });
  });

  it("has required attribute on account select", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    const accountSelect = screen.getByLabelText(/Account:/);
    expect(accountSelect).toHaveAttribute("required");
  });

  it("has required attribute on date input", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    const dateInput = screen.getByLabelText(/Date:/);
    expect(dateInput).toHaveAttribute("required");
  });

  it("has required attribute on balance input", () => {
    render(<BalanceForm accounts={mockAccounts} />);
    const balanceInput = screen.getByLabelText(/Balance:/);
    expect(balanceInput).toHaveAttribute("required");
  });

  it("clears errors on new submission", async () => {
    const mockError = { fields: { balance: "Balance is required" } };
    vi.mocked(actions.createBalance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValueOnce({ data: undefined, error: mockError as any })
      .mockResolvedValueOnce({ data: { success: true }, error: undefined });
    vi.mocked(isInputError)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    render(<BalanceForm accounts={mockAccounts} />);
    // Fill in all required fields
    const accountSelect = screen.getByLabelText(/Account:/);
    const dateInput = screen.getByLabelText(/Date:/);
    const balanceInput = screen.getByLabelText(/Balance:/);
    fireEvent.change(accountSelect, { target: { value: "a1" } });
    fireEvent.change(dateInput, { target: { value: "2024-01-15" } });
    fireEvent.change(balanceInput, { target: { value: "500" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Balance is required")).toBeInTheDocument();
    });

    fireEvent.change(balanceInput, { target: { value: "1000" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText("Balance is required")).not.toBeInTheDocument();
    });
  });
});
