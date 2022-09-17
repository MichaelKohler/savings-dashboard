import invariant from "tiny-invariant";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import AccountForm from "~/components/forms/account";
import { getAccount, updateAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");
  const account = await getAccount({ id: params.accountId, userId });
  return json({ account });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");
  const id = formData.get("id");

  const errors = {
    generic: null,
    name: null,
    color: null,
    id: null,
  };

  if (typeof id !== "string" || id.length === 0) {
    return json(
      { errors: { ...errors, id: "ID is required and must be text" } },
      { status: 400 }
    );
  }

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

  await updateAccount({ id, userId, name, color });

  return redirect("/accounts");
}

export default function EditAccountPage() {
  const data = useLoaderData();

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit account - {data.account.name}</h1>
      <AccountForm initialData={data.account} />
    </>
  );
}
