import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useLoaderData } from "react-router";

import Button from "~/components/button";
import Swatch from "~/components/swatch";
import { getAccounts } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Accounts",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId });
  return { accounts };
}

export default function AccountsPage() {
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
        <Button>+ New Account</Button>
      </Link>

      <table className="mt-5 min-w-full">
        <thead className="border-b text-left">
          <tr>
            <th className="w-10 pr-2"></th>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.accounts.map((account) => {
            return (
              <tr
                className={`border-b ${account.archived ? "text-gray-300" : ""}`}
                key={account.id}
              >
                <td className="w-10 pr-2">
                  <Swatch color={account.color} />
                </td>
                <td className="pr-2">
                  <span className="block">
                    {account.name}
                    {account.group?.name ? ` (${account.group.name})` : ""}
                  </span>
                  {account.type?.name ? (
                    <span className="block text-sm text-gray-400">
                      {account.type?.name}
                    </span>
                  ) : null}
                </td>
                <td className="text-right text-black">
                  <Link
                    to={`/accounts/${account.id}/edit`}
                    className="inline-block"
                  >
                    <Button>Edit</Button>
                  </Link>
                  {!markedForDeletion[account.id] && (
                    <span className="ml-4">
                      <Button isDanger onClick={markForDeletion(account.id)}>
                        X
                      </Button>
                    </span>
                  )}
                  {markedForDeletion[account.id] && (
                    <Form
                      action={`/accounts/${account.id}/delete`}
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
