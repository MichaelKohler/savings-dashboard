import React from "react";
import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center bg-slate-800 p-4 text-white">
      <p className="mt-4">
        Made in Berlin by{" "}
        <a
          href="https://mkohler.dev"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          Michael Kohler
        </a>
      </p>
    </footer>
  );
}
