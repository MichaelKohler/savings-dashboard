interface Props {
  isSubmit?: boolean;
  isDanger?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  isSubmit = false,
  isDanger = false,
  isDisabled = false,
  onClick,
  children,
}: Props) {
  const colorClasses = isDanger
    ? "bg-mkerror hover:bg-mkerror-muted active:bg-mkerror-muted"
    : "bg-mk hover:bg-mk-tertiary active:bg-mk-tertiary text-white";
  const classes = `text-white-100 rounded py-2 px-4 mt-1 mb-1 transition duration-300 ${colorClasses}`;

  return (
    <button
      type={isSubmit ? "submit" : "button"}
      className={classes}
      disabled={isDisabled}
      {...(onClick ? { onClick } : {})}
    >
      {children}
    </button>
  );
}
