import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");

  await deleteAccount({ id: params.accountId, userId });

  return redirect("/accounts");
}
