import { useState } from "react";
import { actions } from "astro:actions";
import type { ReactNode } from "react";
import type { User } from "~/models/user.server";

interface MainProps {
  user?: User | null;
  children?: ReactNode;
}

export default function Main({ user, children }: MainProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const formData = new FormData();
    const { data, error } = await actions.logout(formData);

    if (error) {
      console.error("Failed to logout", error);
      setIsLoggingOut(false);
      return;
    }

    if (data) {
      window.location.href = data.redirect;
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-white">
      <div className="grow p-4 md:p-8">{children}</div>
      <ul className="sticky bottom-0 z-50 flex w-screen flex-row justify-between border-t border-gray-300 bg-white px-6 py-4 md:px-12">
        {!user && (
          <li>
            <a
              className="flex flex-col items-center justify-center py-4"
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
                className="flex flex-col items-center justify-center py-4"
                href="/accounts"
              >
                <span>📒</span>
                <span className="mt-2 hidden md:inline">Accounts</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col items-center justify-center py-4"
                href="/groups"
              >
                <span>🫙</span>
                <span className="mt-2 hidden md:inline">Groups</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col items-center justify-center py-4"
                href="/types"
              >
                <span>🏦</span>
                <span className="mt-2 hidden md:inline">Types</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col items-center justify-center py-4"
                href="/balances"
              >
                <span>💰</span>
                <span className="mt-2 hidden md:inline">Balances</span>
              </a>
            </li>
            <li>
              <a
                className="flex flex-col items-center justify-center py-4"
                href="/charts"
              >
                <span>📈</span>
                <span className="mt-2 hidden md:inline">Charts</span>
              </a>
            </li>
            <li className="flex flex-col items-center justify-center py-4">
              <button
                onClick={handleLogout}
                className="flex flex-col"
                disabled={isLoggingOut}
                aria-label={isLoggingOut ? "Logging out..." : "Logout"}
              >
                <span>🔓</span>
                <span className="mt-2 hidden md:inline">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
