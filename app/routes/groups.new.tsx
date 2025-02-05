import { useEffect, useRef } from "react";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useActionData } from "react-router";

import GroupForm from "~/components/forms/group";
import { createGroup } from "~/models/groups.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "New Group",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    throw data({ errors: { name: "Name is required" } }, { status: 400 });
  }

  await createGroup({ name, userId });
  return redirect("/groups");
}

export default function NewGroupPage() {
  const actionData = useActionData<{ errors?: { name?: string } }>();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit group</h1>
      <GroupForm />
    </>
  );
}
