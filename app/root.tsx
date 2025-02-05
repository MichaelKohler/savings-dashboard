import React from "react";
import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import Header from "./components/header";
import Main from "./components/main";
import tailwindStylesheetUrl from "./styles/tailwind.css?url";
import { getUser } from "./session.server";

export function headers(): ReturnType<HeadersFunction> {
  return {
    "Permissions-Policy":
      "accelerometer=(), ambient-light-sensor=(), battery=(), camera=(), microphone=(), geolocation=(), gyroscope=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

export function links(): ReturnType<LinksFunction> {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
}

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "savings.michaelkohler.info",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // This is used in the `getUser` function through `useMatchesData("root")`
  // Do not remove this, even though it's not used in this file!
  return {
    user: await getUser(request),
  };
}

function App({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dosis:wght@700&family=Raleway&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Header />
        <Main />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function DefaultApp() {
  return <App />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <App>
        <main className="flex h-full min-h-screen justify-center bg-white">
          <h1 className="mt-10 font-title text-3xl">Page not found</h1>
        </main>
      </App>
    );
  }

  return (
    <App>
      <main className="flex h-full min-h-screen justify-center bg-white">
        <h1 className="mt-10 font-title text-3xl">Something went wrong</h1>
      </main>
    </App>
  );
}
