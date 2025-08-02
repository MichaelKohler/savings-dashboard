import { redirect } from "react-router";
import { action } from "./accounts.$accountId.delete";
import * as sessionServer from "~/session.server";
import * as accountModel from "~/models/accounts.server";

vi.mock("~/session.server", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("~/models/accounts.server", () => ({
  deleteAccount: vi.fn(),
}));

vi.mock("react-router", () => ({
  redirect: vi.fn(),
}));

describe("routes/accounts.$accountId.delete", () => {
  it("should delete an account and redirect", async () => {
    vi.spyOn(sessionServer, "requireUserId").mockResolvedValue("user-1");
    vi.spyOn(accountModel, "deleteAccount").mockResolvedValue({ count: 1 });
    vi.mocked(redirect).mockReturnValue(new Response(null, { status: 302 }));

    const request = new Request("http://localhost/accounts/acc-1/delete", {
      method: "POST",
    });
    const params = { accountId: "acc-1" };

    const response = await action({ request, params, context: {} });

    expect(sessionServer.requireUserId).toHaveBeenCalledWith(request);
    expect(accountModel.deleteAccount).toHaveBeenCalledWith({
      id: "acc-1",
      userId: "user-1",
    });
    expect(redirect).toHaveBeenCalledWith("/accounts");
    expect(response.status).toBe(302);
  });
});
