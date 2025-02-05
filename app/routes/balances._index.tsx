import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useLoaderData } from "react-router";

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
  return { balances };
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
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.balances.map((balance) => {
            return (
              <tr className="border-b" key={balance.id}>
                <td className="pr-2">
                  {balance.date.toISOString().substring(0, 10)}
                </td>
                <td className="pr-2">
                  <span className="block">{balance.account.name}</span>
                  {balance.account.group?.name && (
                    <span className="block text-gray-500 text-sm">
                      {balance.account.group.name}
                    </span>
                  )}
                </td>
                <td className="pr-2">{balance.balance}</td>
                <td className="text-right">
                  <Link
                    to={`/balances/${balance.id}/edit`}
                    className="inline-block"
                  >
                    <Button>Edit</Button>
                  </Link>
                  {!markedForDeletion[balance.id] && (
                    <span className="ml-4">
                      <Button isDanger onClick={markForDeletion(balance.id)}>
                        X
                      </Button>
                    </span>
                  )}
                  {markedForDeletion[balance.id] && (
                    <Form
                      action={`/balances/${balance.id}/delete`}
                      method="post"
                      className="ml-4 inline-block"
                    >
                      <Button isDanger isSubmit>
                        X?
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
