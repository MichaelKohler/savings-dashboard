import invariant from "tiny-invariant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteType } from "~/models/types.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.typeId, "typeId not found");

  await deleteType({ id: params.typeId, userId });

  return redirect("/types");
}
