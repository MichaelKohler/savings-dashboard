interface Props {
  color: string;
}

export default function Swatch({ color }: Props) {
  return (
    <button
      className="rounded px-4 py-4"
      style={{ backgroundColor: color, pointerEvents: "none" }}
    ></button>
  );
}
