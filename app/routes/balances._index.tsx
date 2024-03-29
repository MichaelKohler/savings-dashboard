import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import Button from "~/components/button";
import { getBalances } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Balances",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const balances = await getBalances({ userId });
  return json({ balances });
}

export default function BalancesPage() {
  const data = useLoaderData<typeof loader>();
  const [markedForDeletion, setMarkedForDeletion] = useState<
    Record<string, boolean>
  >({});

  const markForDeletion = (id: string) => () => {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <main>
      <Link to="new">
        <Button>+ New Balance</Button>
      </Link>

      <table className="mt-5 min-w-full">
        <thead className="border-b text-left">
          <tr>
            <th className="pr-2">Date</th>
            <th className="pr-2">Account</th>
            <th className="pr-2">Balance</th>
            <th className="pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.balances.map((balance) => {
            return (
              <tr className="border-b" key={balance.id}>
                <td className="pr-2">{balance.date.substring(0, 10)}</td>
                <td className="pr-2">{balance.account.name}</td>
                <td className="pr-2">{balance.balance}</td>
                <td className="pr-2">
                  <Link
                    to={`/balances/${balance.id}/edit`}
                    className="mr-4 inline-block"
                  >
                    <Button>Edit</Button>
                  </Link>
                  {!markedForDeletion[balance.id] && (
                    <Button isDanger onClick={markForDeletion(balance.id)}>
                      Mark for deletion
                    </Button>
                  )}
                  {markedForDeletion[balance.id] && (
                    <Form
                      action={`/balances/${balance.id}/delete`}
                      method="post"
                      className="inline-block"
                    >
                      <Button isDanger isSubmit>
                        Delete
                      </Button>
                    </Form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
