import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import Button from "~/components/button";
import { requireUserId } from "~/session.server";
import { getTypes } from "~/models/types.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Types",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const types = await getTypes({ userId });
  return json({ types });
}

export default function TypesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <Link to="new">
        <Button>+ New Type</Button>
      </Link>

      <table className="mt-5 min-w-full">
        <thead className="border-b text-left">
          <tr>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.types.map((type) => {
            return (
              <tr className="border-b" key={type.id}>
                <td className="pr-2">{type.name}</td>
                <td className="text-right">
                  <Link
                    to={`/types/${type.id}/edit`}
                    className="mr-4 inline-block"
                  >
                    <Button>Edit</Button>
                  </Link>
                  <Form
                    action={`/types/${type.id}/delete`}
                    method="post"
                    className="inline-block"
                  >
                    <Button isDanger isSubmit>
                      X?
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
