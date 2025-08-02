import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useLoaderData, useRouteError } from "react-router";

import AccountForm from "~/components/forms/account";
import { createAccount } from "~/models/accounts.server";
import { getGroups } from "~/models/groups.server";
import { getTypes } from "~/models/types.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "New account",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const groups = await getGroups({ userId });
  const types = await getTypes({ userId });
  return { groups, types };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const color = formData.get("color");
  const groupId = formData.get("groupId");
  const typeId = formData.get("typeId");
  const showInGraphs = formData.has("showInGraphs");

  const errors = {
    name: null,
    color: null,
    groupId: null,
    typeId: null,
  };

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

  await createAccount(
    {
      name,
      color,
      showInGraphs,
      groupId,
      typeId,
    },
    userId
  );

  return redirect("/accounts");
}

type ActionError = {
  data: {
    errors: {
      name?: string;
      color?: string;
      generic?: string;
      groupId?: string;
      typeId?: string;
    };
  };
};

export default function NewAccountPage() {
  const data = useLoaderData<typeof loader>();
  const error = useRouteError() as ActionError;

  return (
    <>
      <h1 className="pb-4 text-3xl">Add new account</h1>
      <AccountForm
        groups={data.groups}
        types={data.types}
        errors={error?.data?.errors}
      />
    </>
  );
}
