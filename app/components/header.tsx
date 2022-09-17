import React from "react";
import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <header className="bg-slate-800 p-4 text-white">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-3xl font-bold">
          <Link to="/">
            savings<span className="text-sky-200">.michaelkohler.info</span>
          </Link>
        </h1>
      </div>
    </header>
  );
}
