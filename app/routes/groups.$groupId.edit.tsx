import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";

import GroupForm from "~/components/forms/group";
import { getGroup, updateGroup } from "~/models/groups.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Edit Group",
    },
  ];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");
  const group = await getGroup({ id: params.groupId, userId });
  return json({ group });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");

  if (typeof id !== "string" || !id) {
    return json({ errors: { id: "Invalid group ID" } }, { status: 400 });
  }
  if (typeof name !== "string" || !name) {
    return json({ errors: { name: "Name is required" } }, { status: 400 });
  }

  await updateGroup({ id, name, userId });

  return redirect("/groups");
}

export default function EditGroupPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit group</h1>
      <GroupForm initialData={data.group} />
    </>
  );
}
