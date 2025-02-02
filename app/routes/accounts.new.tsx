import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import AccountForm from "~/components/forms/account";
import { createAccount } from "~/models/accounts.server";
import { getGroups } from "~/models/groups.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "New account",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const groups = await getGroups({ userId });
  return json({ groups });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");
  const groupId = formData.get("groupId");
  const showInGraphs = formData.has("showInGraphs");

  const errors = {
    name: null,
    color: null,
    groupId: null,
  };

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { ...errors, name: "Name is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof color !== "string" || color.length === 0) {
    return json(
      { errors: { ...errors, color: "Color is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof groupId !== "undefined" && typeof groupId !== "string") {
    return json(
      {
        errors: {
          ...errors,
          groupId: "Group ID must be a string",
        },
      },
      { status: 400 }
    );
  }

  await createAccount(
    {
      name,
      color,
      showInGraphs,
      groupId,
    },
    userId
  );

  return redirect("/accounts");
}

export default function NewAccountPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Add new account</h1>
      <AccountForm groups={data.groups} />
    </>
  );
}
