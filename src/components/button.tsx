interface Props {
  isSubmit?: boolean;
  isDanger?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  isSubmit = false,
  isDanger = false,
  isDisabled = false,
  isFullWidth = false,
  onClick,
  children,
}: Props) {
  const colorClasses = isDisabled
    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
    : isDanger
      ? "bg-mkerror hover:bg-mkerror-muted active:bg-mkerror-muted"
      : "bg-mk hover:bg-mk-tertiary active:bg-mk-tertiary text-white";
  const classes = `text-white-100 rounded py-2 px-4 mt-1 mb-1 transition-colors duration-[250ms] ${colorClasses}${isFullWidth ? " w-full" : ""}`;

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
