import invariant from "tiny-invariant";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import TypeForm from "~/components/forms/type";
import { requireUserId } from "~/session.server";
import { getType, updateType } from "~/models/types.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Edit Type",
    },
  ];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.typeId, "typeId not found");
  const type = await getType({ id: params.typeId, userId });
  return json({ type });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const name = formData.get("name");

  const errors = {
    id: null,
    name: null,
  };

  if (typeof id !== "string" || id.length === 0) {
    return json(
      { errors: { ...errors, id: "ID is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof name !== "string" || name.length === 0) {
    return json(
      {
        errors: {
          ...errors,
          typeId: "Name is required and must be a number",
        },
      },
      { status: 400 }
    );
  }

  await updateType({
    id,
    userId,
    name,
  });

  return redirect("/types");
}

export default function EditTypePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit type</h1>
      <TypeForm initialData={data.type} />
    </>
  );
}
