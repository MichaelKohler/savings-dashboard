import { Form, NavLink, Outlet } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Sidebar() {
  const user = useOptionalUser();

  return (
    <div className="flex bg-white">
      <div
        className={`${
          !user && "hidden"
        } min-h-screen w-10 border-r md:block md:w-40`}
      >
        <ul>
          {!user && (
            <li>
              <NavLink
                className={({ isActive }) =>
                  `align-items text-l flex w-full flex-row gap-1 border-b p-4 ${
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
                    `align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
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
                    `align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/groups"
                >
                  🫙<span className="ml-2 hidden md:inline">Groups</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/types"
                >
                  🏦<span className="ml-2 hidden md:inline">Types</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
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
                    `align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/charts"
                >
                  📈<span className="ml-2 hidden md:inline">Charts</span>
                </NavLink>
              </li>
              <li className="align-items text-l flex w-full flex-row justify-center gap-1 border-b py-4 md:justify-start md:p-4">
                <Form action="/logout" method="post">
                  <button type="submit">
                    🔓 <span className="ml-2 hidden md:inline">Logout</span>
                  </button>
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
