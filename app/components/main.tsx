import { Form, NavLink, Outlet } from "@remix-run/react";
import Button from "~/components/button";
import { useOptionalUser } from "~/utils";

export default function Sidebar() {
  const user = useOptionalUser();

  return (
    <div className="flex bg-white">
      <div
        className={`${
          !user && "hidden"
        } min-h-screen w-10 border-r bg-mklight-100 md:block md:w-80`}
      >
        <ul>
          {!user && (
            <li>
              <NavLink
                className={({ isActive }) =>
                  `align-items text-l block flex w-full flex-row gap-1 border-b p-4 ${
                    isActive ? "bg-white" : ""
                  }`
                }
                to="/login"
              >
                Login
              </NavLink>
            </li>
          )}
          {user && (
            <>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l block flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/accounts"
                >
                  🏦<span className="ml-2 hidden md:inline">Accounts</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l block flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/balances"
                >
                  💰<span className="ml-2 hidden md:inline">Balances</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l block flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/charts"
                >
                  📈<span className="ml-2 hidden md:inline">Charts</span>
                </NavLink>
              </li>

              {/* We show the button on desktop view, and just the lock on mobile */}
              <li className="hidden md:block">
                <Form action="/logout" method="post" className="mt-4 ml-4">
                  <Button isSubmit>Logout</Button>
                </Form>
              </li>
              <li className="flex justify-center md:hidden">
                <Form action="/logout" method="post" className="mt-4">
                  <button type="submit">🔓</button>
                </Form>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
