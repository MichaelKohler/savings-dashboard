import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return {
    title: "Dashboard",
  };
}

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return json({});
}

export default function Index() {
  return <p>Select a category from the left to get started!</p>;
}
