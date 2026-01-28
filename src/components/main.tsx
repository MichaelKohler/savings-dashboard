import type { ReactNode } from "react";
import type { User } from "~/models/user.server";

interface MainProps {
  user?: User | null;
  children?: ReactNode;
}

export default function Main({ children }: MainProps) {
  return (
    <div className="relative flex h-screen flex-col bg-white">
      <div className="grow p-4 md:p-8">{children}</div>
    </div>
  );
}
