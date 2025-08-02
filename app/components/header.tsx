import { Link } from "react-router";

export default function Header() {
  return (
    <header className="bg-mk p-4 text-white z-50 relative">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-3xl">
          <Link to="/">
            savings
            <span className="text-mklight-300">.michaelkohler.info</span>
          </Link>
        </h1>
      </div>
    </header>
  );
}
