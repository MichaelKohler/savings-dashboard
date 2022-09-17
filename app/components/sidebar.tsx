import { Form, NavLink, Outlet } from "@remix-run/react";
import Button from "~/components/button";
import { useOptionalUser } from "~/utils";

export default function Sidebar() {
  const user = useOptionalUser();

  return (
    <div className="flex h-screen bg-white">
      <div className="h-full w-40 border-r bg-slate-100 md:w-80">
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
                    `align-items text-l block flex w-full flex-row gap-1 border-b p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/accounts"
                >
                  🏦&nbsp;Accounts
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `align-items text-l block flex w-full flex-row gap-1 border-b p-4 ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to="/user"
                >
                  👤&nbsp;Add User
                </NavLink>
              </li>
              <li>
                <Form action="/logout" method="post" className="mt-4 ml-4">
                  <Button isSubmit>Logout</Button>
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
