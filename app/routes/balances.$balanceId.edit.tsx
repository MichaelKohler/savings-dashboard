import invariant from "tiny-invariant";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import BalanceForm from "~/components/forms/balance";
import { getAccounts } from "~/models/accounts.server";
import { getBalance, updateBalance } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Edit Balance",
    },
  ];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.balanceId, "balanceId not found");
  const accounts = await getAccounts({ userId, archived: false });
  const balance = await getBalance({ id: params.balanceId, userId });
  return json({ accounts, balance });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const date = formData.get("date");
  const balance = formData.get("balance");
  const accountId = formData.get("accountId");

  const errors = {
    id: null,
    date: null,
    balance: null,
    accountId: null,
  };

  if (typeof id !== "string" || id.length === 0) {
    return json(
      { errors: { ...errors, id: "ID is required and must be text" } },
      { status: 400 }
    );
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  await updateBalance({
    id,
    userId,
    date: new Date(date),
    accountId,
    balance: parsedBalance,
  });

  return redirect("/balances");
}

export default function EditBalancePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit balance</h1>
      <BalanceForm initialData={data.balance} accounts={data.accounts} />
    </>
  );
}
