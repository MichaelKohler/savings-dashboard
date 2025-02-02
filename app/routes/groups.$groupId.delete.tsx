import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireUserId } from "~/session.server";
import { deleteGroup } from "~/models/groups.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  await deleteGroup({ id: params.groupId, userId });

  return redirect("/groups");
}
