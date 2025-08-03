import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import AccountForm from "~/components/forms/account";

// Mock react-router
vi.mock("react-router", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form>{children}</form>
  ),
  useActionData: () => null,
  useNavigation: () => ({ formData: null }),
}));

// Mock Button component
vi.mock("~/components/button", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

describe("AccountForm", () => {
  const mockGroups = [
    {
      id: "group1",
      name: "Savings",
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTypes = [
    {
      id: "type1",
      name: "Bank Account",
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("renders form for new account", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/group/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("populates select options correctly", () => {
    render(<AccountForm groups={mockGroups} types={mockTypes} />);

    expect(screen.getByText("Bank Account")).toBeInTheDocument();
    expect(screen.getByText("Savings")).toBeInTheDocument();
  });
});
