import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import Button from "~/components/button";
import { getAccounts } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return {
    title: "Savings - Accounts",
  };
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId });
  return json({ accounts });
}

export default function AccountsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <Link to="new">
        <Button>+ New Account</Button>
      </Link>
    </main>
  );
}
