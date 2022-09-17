import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import AccountForm from "~/components/forms/account";
import { createAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return {
    title: "New account",
  };
}

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");

  const errors = {
    name: null,
    color: null,
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

  await createAccount(
    {
      name,
      color,
    },
    userId
  );

  return redirect("/accounts");
}

export default function NewAccountPage() {
  return (
    <>
      <h1 className="pb-4 text-3xl">Add new account</h1>
      <AccountForm />
    </>
  );
}
