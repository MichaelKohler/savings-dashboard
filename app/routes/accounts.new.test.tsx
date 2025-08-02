import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import NewAccountPage, { loader, action } from "./accounts.new";
import * as sessionServer from "~/session.server";
import * as accountModel from "~/models/accounts.server";
import * as groupModel from "~/models/groups.server";
import * as typeModel from "~/models/types.server";
import type { Group, Type, Account } from "@prisma/client";

vi.mock("~/session.server", () => ({ requireUserId: vi.fn() }));
vi.mock("~/models/accounts.server", () => ({
  createAccount: vi.fn(),
}));
vi.mock("~/models/groups.server", () => ({ getGroups: vi.fn() }));
vi.mock("~/models/types.server", () => ({ getTypes: vi.fn() }));

describe("routes/accounts.new", () => {
  const mockGroups: (Group & { accounts: Account[] })[] = [
    {
      id: "g1",
      name: "Group 1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
  ];
  const mockTypes: (Type & { accounts: Account[] })[] = [
    {
      id: "t1",
      name: "Type 1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
  ];

  const setup = (initialEntries = ["/accounts/new"]) => {
    const router = createMemoryRouter(
      [
        {
          path: "/accounts/new",
          element: <NewAccountPage />,
          loader,
          action,
          errorElement: <NewAccountPage />,
        },
        {
          path: "/accounts",
          element: <div>Accounts Page</div>,
        },
      ],
      { initialEntries }
    );

    render(<RouterProvider router={router} />);
    return { router };
  };

  beforeEach(() => {
    vi.spyOn(sessionServer, "requireUserId").mockResolvedValue("user-1");
    vi.spyOn(groupModel, "getGroups").mockResolvedValue(mockGroups);
    vi.spyOn(typeModel, "getTypes").mockResolvedValue(mockTypes);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the new account form", async () => {
    setup();
    expect(
      await screen.findByRole("heading", { name: /Add new account/ })
    ).toBeInTheDocument();
  });

  it("should create account and redirect on valid submission", async () => {
    const { router } = setup();
    vi.spyOn(accountModel, "createAccount").mockResolvedValue({} as any);

    await userEvent.type(
      await screen.findByLabelText(/Name/),
      "New Test Account"
    );
    // The color picker is not a standard input, so we can't use userEvent.type.
    // Instead, we will just fill the value directly.
    const colorInput = await screen.findByLabelText(/Color/);
    fireEvent.change(colorInput, { target: { value: "#ff0000" } });

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    expect(accountModel.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Test Account",
        color: "#ff0000",
      }),
      "user-1"
    );

    await screen.findByText("Accounts Page");
    expect(router.state.location.pathname).toBe("/accounts");
  });

  it("should display an error message on failed submission", async () => {
    setup();
    await userEvent.click(await screen.findByRole("button", { name: /Save/i }));

    expect(
      await screen.findByText("Name is required and must be text")
    ).toBeInTheDocument();
  });
});
