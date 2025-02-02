import { Link, useLoaderData, Form } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import Button from "~/components/button";
import { getGroups } from "~/models/groups.server";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const groups = await getGroups({ userId }); // ignoring user scoping for simplicity
  return json({ groups });
}

export default function GroupsIndexPage() {
  const { groups } = useLoaderData<typeof loader>();

  return (
    <main>
      <Link to="new">
        <Button>+ New Group</Button>
      </Link>
      <table className="mt-5 min-w-full">
        <thead className="border-b text-left">
          <tr>
            <th className="pr-2">Name</th>
            <th className="pr-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id} className="border-b">
              <td className="pr-2">{group.name}</td>
              <td className="pr-2">
                <Link
                  to={`/groups/${group.id}/edit`}
                  className="mr-4 inline-block"
                >
                  <Button>Edit</Button>
                </Link>
                <Form
                  method="post"
                  action={`/groups/${group.id}/delete`}
                  className="inline-block"
                >
                  <Button isDanger isSubmit>
                    X
                  </Button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
