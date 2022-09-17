import invariant from "tiny-invariant";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteBalance } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.balanceId, "balanceId not found");

  await deleteBalance({ id: params.balanceId, userId });

  return redirect("/balances");
}
