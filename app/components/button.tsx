type Props = {
  isSubmit?: boolean;
  isDanger?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
};

export default function Button({
  isSubmit = false,
  isDanger = false,
  isDisabled = false,
  children,
}: Props) {
  const colorClasses = isDanger
    ? "bg-red-400 hover:bg-red-500 active:bg-red-500"
    : "bg-slate-200 hover:bg-slate-300 active:bg-slate-300";
  const classes = `text-white-100 rounded py-2 px-4 mt-1 mb-1 transition duration-300 ${colorClasses}`;

  return (
    <button
      type={isSubmit ? "submit" : "button"}
      className={classes}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
