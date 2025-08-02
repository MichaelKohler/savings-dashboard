import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import userEvent from "@testing-library/user-event";
import EditAccountPage, { loader, action } from "./accounts.$accountId.edit";
import * as sessionServer from "~/session.server";
import * as accountModel from "~/models/accounts.server";
import * as groupModel from "~/models/groups.server";
import * as typeModel from "~/models/types.server";
import type { Account, Group, Type } from "@prisma/client";

vi.mock("~/session.server", () => ({ requireUserId: vi.fn() }));
vi.mock("~/models/accounts.server", () => ({
  getAccount: vi.fn(),
  updateAccount: vi.fn(),
}));
vi.mock("~/models/groups.server", () => ({ getGroups: vi.fn() }));
vi.mock("~/models/types.server", () => ({ getTypes: vi.fn() }));

describe("routes/accounts.$accountId.edit", () => {
  const mockAccount: Account = {
    id: "acc-1",
    name: "Test Account",
    color: "#ff0000",
    showInGraphs: true,
    archived: false,
    userId: "user-1",
    groupId: "g1",
    typeId: "t1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
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

  const setup = (initialEntries = ["/accounts/acc-1/edit"]) => {
    const router = createMemoryRouter(
      [
        {
          path: "/accounts/:accountId/edit",
          element: <EditAccountPage />,
          loader,
          action,
          errorElement: <EditAccountPage />,
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
    vi.spyOn(accountModel, "getAccount").mockResolvedValue(mockAccount);
    vi.spyOn(groupModel, "getGroups").mockResolvedValue(mockGroups);
    vi.spyOn(typeModel, "getTypes").mockResolvedValue(mockTypes);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with loaded data", async () => {
    setup();
    expect(
      await screen.findByRole("heading", {
        name: /Edit account - Test Account/,
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toHaveValue("Test Account");
  });

  it("should update account and redirect on valid submission", async () => {
    const { router } = setup();
    vi.spyOn(accountModel, "updateAccount").mockResolvedValue(mockAccount);

    await userEvent.type(await screen.findByLabelText(/Name/), " Updated");
    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    expect(accountModel.updateAccount).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Account Updated" })
    );

    // Wait for the router to settle after redirect
    await screen.findByText("Accounts Page");
    expect(router.state.location.pathname).toBe("/accounts");
  });

  it("should display an error message on failed submission", async () => {
    setup();

    await userEvent.clear(await screen.findByLabelText(/Name/));
    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    expect(
      await screen.findByText("Name is required and must be text")
    ).toBeInTheDocument();
  });
});
