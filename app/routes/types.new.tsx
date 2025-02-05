import { useEffect, useRef } from "react";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useActionData } from "react-router";

import TypeForm from "~/components/forms/type";
import { createType } from "~/models/types.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "New Type",
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

  await createType({ name, userId });
  return redirect("/types");
}

export default function NewTypePage() {
  const actionData = useActionData<{ errors?: { name?: string } }>();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit type</h1>
      <TypeForm />
    </>
  );
}
