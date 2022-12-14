import React from "react";
import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";

import Header from "./components/header";
import Main from "./components/main";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

export function links(): ReturnType<LinksFunction> {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
}

export function meta(): ReturnType<MetaFunction> {
  return {
    charset: "utf-8",
    title: "savings.michaelkohler.info",
    viewport: "width=device-width,initial-scale=1",
  };
}

export async function loader({ request }: LoaderArgs) {
  // This is used in the `getUser` function through `useMatchesData("root")`
  // Do not remove this, even though it's not used in this file!
  return json({
    user: await getUser(request),
  });
}

function App({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="crossorigin"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dosis:wght@700&family=Raleway&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Header />
        <Main />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function DefaultApp() {
  return <App />;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <App>
        <main className="flex h-full min-h-screen justify-center bg-white">
          <h1 className="mt-10 font-title text-3xl">Page not found</h1>
        </main>
      </App>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
