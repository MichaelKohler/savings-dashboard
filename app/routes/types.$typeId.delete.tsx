import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { deleteType } from "~/models/types.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.typeId, "typeId not found");

  await deleteType({ id: params.typeId, userId });

  return redirect("/types");
}
