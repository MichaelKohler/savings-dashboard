import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Dashboard",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return redirect("/accounts");
}
