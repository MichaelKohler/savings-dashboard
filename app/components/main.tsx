import { Form, NavLink, Outlet } from "react-router";
import { useOptionalUser } from "~/utils";

export default function Sidebar() {
  const user = useOptionalUser();

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="p-4 md:p-8 grow">
        <Outlet />
      </div>
      <ul className="sticky bottom-0 bg-white w-screen flex flex-row justify-between py-4 px-6 md:px-12 border-t shadow-[rgba(0,0,0,0.1)_0px_-3px_50px_5px]">
        {!user && (
          <li>
            <NavLink
              className="flex flex-col justify-center items-center py-4"
              to="/login"
            >
              <span>🔐</span>
              <span className="mt-2 hidden md:inline">Login</span>
            </NavLink>
          </li>
        )}
        {user && (
          <>
            <li>
              <NavLink
                className="flex flex-col justify-center items-center py-4"
                to="/accounts"
              >
                <span>📒</span>
                <span className="mt-2 hidden md:inline">Accounts</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className="flex flex-col justify-center items-center py-4"
                to="/groups"
              >
                <span>🫙</span>
                <span className="mt-2 hidden md:inline">Groups</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className="flex flex-col justify-center items-center py-4"
                to="/types"
              >
                <span>🏦</span>
                <span className="mt-2 hidden md:inline">Types</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className="flex flex-col justify-center items-center py-4"
                to="/balances"
              >
                <span>💰</span>
                <span className="mt-2 hidden md:inline">Balances</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className="flex flex-col justify-center items-center py-4"
                to="/charts"
              >
                <span>📈</span>
                <span className="mt-2 hidden md:inline">Charts</span>
              </NavLink>
            </li>
            <li className="flex flex-col justify-center items-center py-4">
              <Form action="/logout" method="post">
                <button type="submit" className="flex flex-col">
                  <span>🔓</span>
                  <span className="mt-2 hidden md:inline">Logout</span>
                </button>
              </Form>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
