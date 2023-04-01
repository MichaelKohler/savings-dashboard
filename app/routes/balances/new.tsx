import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import BalanceForm from "~/components/forms/balance";
import { getAccounts } from "~/models/accounts.server";
import { createBalance } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<V2_MetaFunction> {
  return [
    {
      title: "New Balance",
    },
  ];
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId });
  return json({ accounts });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const balance = formData.get("balance");
  const accountId = formData.get("accountId");

  const errors = {
    date: null,
    balance: null,
    accountId: null,
  };

  if (typeof date !== "string" || date.length === 0) {
    return json(
      { errors: { ...errors, date: "Date is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof balance !== "string" || balance.length === 0) {
    return json(
      {
        errors: {
          ...errors,
          balance: "Balance is required",
        },
      },
      { status: 400 }
    );
  }

  let parsedBalance = 0;
  try {
    parsedBalance = parseInt(balance);
  } catch (error) {
    return json(
      {
        errors: {
          ...errors,
          balance: "Balance must be a number",
        },
      },
      { status: 400 }
    );
  }

  if (typeof accountId !== "string" || accountId.length === 0) {
    return json(
      {
        errors: {
          ...errors,
          accountId: "Account ID is required and must be a number",
        },
      },
      { status: 400 }
    );
  }

  await createBalance(
    {
      date: new Date(date),
      balance: parsedBalance,
      accountId,
    },
    userId
  );

  return redirect("/balances");
}

export default function NewBalancePage() {
  const data = useLoaderData();

  return (
    <>
      <h1 className="pb-4 text-3xl">Add new balance</h1>
      <BalanceForm accounts={data.accounts} />
    </>
  );
}
