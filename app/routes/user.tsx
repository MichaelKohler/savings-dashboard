import * as React from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { validateEmail } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  // Note that any registered user can create more users
  // There is no concept such as an admin role!
  await requireUserId(request);
  return json({ errors: null });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = {
    email: null,
    password: null,
  };

  if (!validateEmail(email)) {
    return json(
      { errors: { ...errors, email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { ...errors, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { ...errors, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      { errors: { ...errors, email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  await createUser(email, password);

  return redirect("/");
}

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Create User",
    },
  ];
}

export default function CreateUserPage() {
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main className="mx-auto my-12 flex min-h-full w-full max-w-md flex-col px-8">
      <Form method="post" className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-mk-text"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors.email ? true : undefined}
              aria-describedby="email-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors.email && (
              <div className="pt-1 text-mkerror" id="email-error">
                {actionData.errors.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-mk-text"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={actionData?.errors.password ? true : undefined}
              aria-describedby="password-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {actionData?.errors.password && (
              <div className="pt-1 text-mkerror" id="password-error">
                {actionData.errors.password}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-mk px-4 py-2 text-white hover:bg-mk-secondary focus:bg-mk-secondary"
        >
          Create User
        </button>
      </Form>
    </main>
  );
}
