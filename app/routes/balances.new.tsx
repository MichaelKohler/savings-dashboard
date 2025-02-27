import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useLoaderData } from "react-router";

import BalanceForm from "~/components/forms/balance";
import { getAccounts } from "~/models/accounts.server";
import { createBalance } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "New Balance",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId, archived: false });
  return { accounts };
}

export async function action({ request }: ActionFunctionArgs) {
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
    throw data(
      { errors: { ...errors, date: "Date is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof balance !== "string" || balance.length === 0) {
    throw data(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw data(
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
    throw data(
      {
        errors: {
          ...errors,
          accountId: "Account ID is required and must be a string",
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
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Add new balance</h1>
      <BalanceForm accounts={data.accounts} />
    </>
  );
}
