import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, useLoaderData } from "react-router";

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
  return { types };
}

export default function TypesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <Link to="new">
        <Button>+ New Type</Button>
      </Link>

      <table className="mt-5 min-w-full">
        <thead className="border-b border-gray-300 text-left">
          <tr>
            <th className="pr-2">Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.types.map((type) => {
            return (
              <tr className="border-b border-gray-300" key={type.id}>
                <td className="pr-2">{type.name}</td>
                <td className="text-right">
                  <Link to={`/types/${type.id}/edit`} className="inline-block">
                    <Button>Edit</Button>
                  </Link>
                  <Form
                    action={`/types/${type.id}/delete`}
                    method="post"
                    className="ml-4 inline-block"
                  >
                    <Button isDanger isSubmit>
                      X
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
