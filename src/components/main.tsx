import type { ReactNode } from "react";
import type { User } from "~/models/user.server";

interface MainProps {
  user?: User | null;
  children?: ReactNode;
}

export default function Main({ user, children }: MainProps) {
  return (
    <div className="bg-white flex flex-col h-screen relative">
      <div className="p-4 md:p-8 grow">
        {children}
      </div>
      <ul className="sticky bottom-0 bg-white w-screen flex flex-row justify-between py-4 px-6 md:px-12 border-t border-gray-300 z-50">
        {!user && (
          <li>
            <a
              className="flex flex-col justify-center items-center py-4"
              href="/login"
            >
              <span>🔐</span>
              <span className="mt-2 hidden md:inline">Login</span>
            </a>
          </li>
        )}
        {user && (
          <>
            <li>
              <a
                className="flex flex-col justify-center items-center py-4"
                href="/accounts"
              >
                <span>📒</span>
                <span className="mt-2 hidden md:inline">Accounts</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col justify-center items-center py-4"
                href="/groups"
              >
                <span>🫙</span>
                <span className="mt-2 hidden md:inline">Groups</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col justify-center items-center py-4"
                href="/types"
              >
                <span>🏦</span>
                <span className="mt-2 hidden md:inline">Types</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col justify-center items-center py-4"
                href="/balances"
              >
                <span>💰</span>
                <span className="mt-2 hidden md:inline">Balances</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col justify-center items-center py-4"
                href="/charts"
              >
                <span>📈</span>
                <span className="mt-2 hidden md:inline">Charts</span>
              </a>
            </li>
            <li className="flex flex-col justify-center items-center py-4">
              <form action="/api/logout" method="post">
                <button type="submit" className="flex flex-col">
                  <span>🔓</span>
                  <span className="mt-2 hidden md:inline">Logout</span>
                </button>
              </form>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
