import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import TypeForm from "~/components/TypeForm";
import { actions, isInputError } from "astro:actions";

describe("TypeForm", () => {
  const mockType = {
    id: "g1",
    name: "Savings",
    userId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createType).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(actions.updateType).mockResolvedValue({
      data: { success: true },
      error: undefined,
    });
    vi.mocked(isInputError).mockReturnValue(false);
    delete (window as { location?: { href?: string } }).location;
    (window as { location?: { href?: string } }).location = { href: "" };
  });

  it("renders form with name field", () => {
    render(<TypeForm />);
    expect(screen.getByLabelText(/Name:/)).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<TypeForm />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("populates form with type data in edit mode", () => {
    render(<TypeForm type={mockType} />);
    expect(screen.getByDisplayValue("Savings")).toBeInTheDocument();
  });

  it("has required attribute on name input", () => {
    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    expect(nameInput).toHaveAttribute("required");
  });

  it("disables save button when submitting", async () => {
    vi.mocked(actions.createType).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Type" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("shows spinner when submitting", async () => {
    vi.mocked(actions.createType).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => new Promise(() => {}) // Never resolves
    );

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Type" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  it("calls create API when creating new type", async () => {
    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Business" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.createType).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("calls update API when editing existing type", async () => {
    render(<TypeForm type={mockType} />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Updated Type" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.updateType).toHaveBeenCalledWith(expect.any(FormData));
    });
  });

  it("redirects to /types on successful submission", async () => {
    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Business" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/types");
    });
  });

  it("displays name error when returned from API", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createType).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("displays generic error on network failure", async () => {
    vi.mocked(actions.createType).mockResolvedValue({
      data: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: {} as any,
    });
    vi.mocked(isInputError).mockReturnValue(false);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "Test Type" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to save type")).toBeInTheDocument();
    });
  });

  it("focuses name input when name error occurs", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createType).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(nameInput);
    });
  });

  it("sets correct aria attributes when name error exists", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createType).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReturnValue(true);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(nameInput).toHaveAttribute("aria-invalid", "true");
      expect(nameInput).toHaveAttribute("aria-errormessage", "name-error");
    });
  });

  it("clears errors on new submission", async () => {
    const mockError = { fields: { name: "Name is required" } };
    vi.mocked(actions.createType)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValueOnce({ data: undefined, error: mockError as any })
      .mockResolvedValueOnce({ data: { success: true }, error: undefined });
    vi.mocked(isInputError)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    fireEvent.change(nameInput, { target: { value: "Valid Name" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  it("re-enables submit button after error", async () => {
    const mockError = { fields: { name: "Name is required" } };

    vi.mocked(actions.createType).mockResolvedValue({
      data: undefined,
      error: mockError as never,
    });
    vi.mocked(isInputError).mockReset().mockReturnValue(true);

    render(<TypeForm />);
    const nameInput = screen.getByLabelText(/Name:/);
    fireEvent.change(nameInput, { target: { value: "a" } });

    const saveButton = screen.getByRole("button", { name: "Save" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    expect(saveButton).toBeEnabled();
  });

  it("prevents form submission and calls preventDefault", async () => {
    render(<TypeForm />);
    const form = screen.getByRole("button", { name: "Save" }).closest("form");
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

    form?.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
