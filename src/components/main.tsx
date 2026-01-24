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
    <div className="bg-white flex flex-col h-screen relative">
      <div className="p-4 md:p-8 grow">{children}</div>
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
