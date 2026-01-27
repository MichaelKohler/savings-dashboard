import { useEffect, useState } from "react";
import { actions } from "astro:actions";
import type { User } from "~/models/user.server";

export default function Header({ user }: { user?: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

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
    <header
      className={`flex bg-mk p-4 text-white ${
        menuOpen ? "flex-col" : "flex-row items-center"
      }`}
    >
      <h1 className="text-xl font-bold">
        <a href="/">
          savings
          <span className="text-mklight-300">.michaelkohler.info</span>
        </a>
      </h1>

      <section
        id="basic-navbar-nav"
        className={
          menuOpen
            ? "mt-9 min-h-screen w-full justify-between"
            : "hidden w-full items-center justify-between lg:flex"
        }
      >
        <nav
          className={`mt-0 flex ${menuOpen ? "flex-col" : "ml-20 flex-row"}`}
        >
          {user ? (
            <>
              <a
                href="/accounts"
                className={`text-white-700 flex ${
                  menuOpen ? "border-b py-12" : "px-8 py-2"
                } text-3xl lg:text-base font-semibold hover:text-mklight-300 hover:transition-colors hover:duration-300 focus:text-mklight-300`}
              >
                Accounts
              </a>
              <a
                href="/groups"
                className={`text-white-700 flex ${
                  menuOpen ? "border-b py-12" : "px-8 py-2"
                } text-3xl lg:text-base font-semibold hover:text-mklight-300 hover:transition-colors hover:duration-300 focus:text-mklight-300`}
              >
                Groups
              </a>
              <a
                href="/types"
                className={`text-white-700 flex ${
                  menuOpen ? "border-b py-12" : "px-8 py-2"
                } text-3xl lg:text-base font-semibold hover:text-mklight-300 hover:transition-colors hover:duration-300 focus:text-mklight-300`}
              >
                Types
              </a>
              <a
                href="/balances"
                className={`text-white-700 flex ${
                  menuOpen ? "border-b py-12" : "px-8 py-2"
                } text-3xl lg:text-base font-semibold hover:text-mklight-300 hover:transition-colors hover:duration-300 focus:text-mklight-300`}
              >
                Balances
              </a>
              <a
                href="/charts"
                className={`text-white-700 flex ${
                  menuOpen ? "border-b py-12" : "px-8 py-2"
                } text-3xl lg:text-base font-semibold hover:text-mklight-300 hover:transition-colors hover:duration-300 focus:text-mklight-300`}
              >
                Charts
              </a>
            </>
          ) : null}
        </nav>

        <section className="mt-8 lg:mt-0">
          {user ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-white-100 rounded bg-mk-tertiary py-2 px-4 hover:bg-mk-secondary active:bg-mk-secondary"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <a
              href="/login"
              className="text-white-100 flex items-center justify-center rounded bg-mk-tertiary py-2 px-4 font-medium hover:bg-mk-secondary active:bg-mk-secondary"
            >
              Log In
            </a>
          )}
        </section>
      </section>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-controls="basic-navbar-nav"
        aria-expanded={menuOpen}
        aria-label="Toggle navigation"
        className="text-white-100 absolute top-3 right-3 h-10 w-10 rounded bg-mk-tertiary hover:bg-mk-secondary active:bg-mk-secondary lg:hidden"
      >
        {menuOpen ? "✕" : "☰"}
      </button>
    </header>
  );
}
