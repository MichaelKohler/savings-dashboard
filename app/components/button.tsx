type Props = {
  isSubmit?: boolean;
  children: React.ReactNode;
};

export default function Button({ isSubmit = false, children }: Props) {
  return (
    <button
      type={isSubmit ? "submit" : "button"}
      className="text-white-100 rounded bg-slate-200 py-2 px-4 hover:bg-slate-300 active:bg-slate-300"
    >
      {children}
    </button>
  );
}
