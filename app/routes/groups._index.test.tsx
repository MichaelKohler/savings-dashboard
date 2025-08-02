import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import GroupsPage, { loader } from "./groups._index";
import * as groupModel from "~/models/groups.server";
import * as sessionServer from "~/session.server";
import type { Group, Account } from "@prisma/client";

process.env.SESSION_SECRET = "test-secret";

vi.mock("~/models/groups.server", () => ({
  getGroups: vi.fn(),
}));

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

describe("routes/groups._index", () => {
  const mockGroups: (Group & { accounts: Account[] })[] = [
    {
      id: "1",
      name: "Group 1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
    {
      id: "2",
      name: "Group 2",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
  ];

  const setup = (initialEntries = ["/groups"]) => {
    const router = createMemoryRouter(
      [
        {
          path: "/groups",
          element: <GroupsPage />,
          loader,
        },
      ],
      { initialEntries }
    );
    render(<RouterProvider router={router} />);
  };

  it("should render a table of groups", async () => {
    vi.spyOn(sessionServer, "requireUserId").mockResolvedValue("user-1");
    vi.spyOn(groupModel, "getGroups").mockResolvedValue(mockGroups);

    setup();

    expect(await screen.findByText("Group 1")).toBeInTheDocument();
    expect(await screen.findByText("Group 2")).toBeInTheDocument();
  });
});
