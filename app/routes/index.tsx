import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return json({});
}

export default function Index() {
  return <p>Select a category from the left to get started!</p>;
}
