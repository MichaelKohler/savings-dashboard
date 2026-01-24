export default function Header() {
  return (
    <header className="bg-mk p-4 text-white">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-3xl">
          <a href="/">
            savings
            <span className="text-mklight-300">.michaelkohler.info</span>
          </a>
        </h1>
      </div>
    </header>
  );
}
