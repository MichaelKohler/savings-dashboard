import invariant from "tiny-invariant";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useLoaderData } from "react-router";

import AccountForm from "~/components/forms/account";
import { getAccount, updateAccount } from "~/models/accounts.server";
import { requireUserId } from "~/session.server";
import { getGroups } from "~/models/groups.server";
import { getTypes } from "~/models/types.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Edit account",
    },
  ];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  invariant(params.accountId, "accountId not found");
  const account = await getAccount({ id: params.accountId, userId });
  const groups = await getGroups({ userId });
  const types = await getTypes({ userId });
  return { account, groups, types };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");
  const groupId = formData.get("groupId");
  const showInGraphs = formData.has("showInGraphs");
  const id = formData.get("id");
  const archived = formData.has("archived");
  const typeId = formData.get("typeId");

  const errors = {
    name: null,
    color: null,
    id: null,
    groudId: null,
    typeId: null,
  };

  if (typeof id !== "string" || id.length === 0) {
    throw data(
      { errors: { ...errors, id: "ID is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof name !== "string" || name.length === 0) {
    throw data(
      { errors: { ...errors, name: "Name is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof color !== "string" || color.length === 0) {
    throw data(
      { errors: { ...errors, color: "Color is required and must be text" } },
      { status: 400 }
    );
  }

  if (typeof groupId !== "undefined" && typeof groupId !== "string") {
    throw data(
      {
        errors: {
          ...errors,
          groupId: "Group ID must be a string",
        },
      },
      { status: 400 }
    );
  }

  if (typeof typeId !== "undefined" && typeof typeId !== "string") {
    throw data(
      {
        errors: {
          ...errors,
          groupId: "Type ID must be a string",
        },
      },
      { status: 400 }
    );
  }

  await updateAccount({
    id,
    userId,
    name,
    color,
    showInGraphs,
    groupId,
    archived,
    typeId,
  });

  return redirect("/accounts");
}

export default function EditAccountPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="pb-4 text-3xl">Edit account - {data.account?.name}</h1>
      <AccountForm
        initialData={data.account}
        groups={data.groups}
        types={data.types}
      />
    </>
  );
}
