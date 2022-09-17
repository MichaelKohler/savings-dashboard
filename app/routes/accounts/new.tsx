import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import AccountForm from "~/components/forms/account";
import { createAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");

  const errors = {
    generic: null,
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
      { errors: { ...errors, to: "Color is required and must be text" } },
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
  return <AccountForm />;
}
