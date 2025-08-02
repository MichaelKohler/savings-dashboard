import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import TypesPage, { loader } from "./types._index";
import * as typeModel from "~/models/types.server";
import * as sessionServer from "~/session.server";
import type { Type, Account } from "@prisma/client";

process.env.SESSION_SECRET = "test-secret";

vi.mock("~/models/types.server", () => ({
  getTypes: vi.fn(),
}));

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

describe("routes/types._index", () => {
  const mockTypes: (Type & { accounts: Account[] })[] = [
    {
      id: "1",
      name: "Type 1",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
    {
      id: "2",
      name: "Type 2",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: [],
    },
  ];

  const setup = (initialEntries = ["/types"]) => {
    const router = createMemoryRouter(
      [
        {
          path: "/types",
          element: <TypesPage />,
          loader,
        },
      ],
      { initialEntries }
    );
    render(<RouterProvider router={router} />);
  };

  it("should render a table of types", async () => {
    vi.spyOn(sessionServer, "requireUserId").mockResolvedValue("user-1");
    vi.spyOn(typeModel, "getTypes").mockResolvedValue(mockTypes);

    setup();

    expect(await screen.findByText("Type 1")).toBeInTheDocument();
    expect(await screen.findByText("Type 2")).toBeInTheDocument();
  });
});
