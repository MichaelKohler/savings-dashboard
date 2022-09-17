import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import Button from "~/components/button";
import Swatch from "~/components/swatch";
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

      <table className="mt-5 min-w-full">
        <thead className="border-b text-left">
          <tr>
            <th>Name</th>
            <th>Color</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.accounts.map((account) => {
            return (
              <tr className="border-b" key={account.id}>
                <td>{account.name}</td>
                <td>
                  <Swatch color={account.color} />
                  <span className="ml-4 inline-block">{account.color}</span>
                </td>
                <td>
                  <Link
                    to={`/accounts/${account.id}/edit`}
                    className="inline-block"
                  >
                    <Button>Edit</Button>
                  </Link>
                  <Form
                    action={`/accounts/${account.id}/delete`}
                    method="post"
                    className="ml-4 inline-block"
                  >
                    <Button isDanger isSubmit>
                      Delete
                    </Button>
                  </Form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
