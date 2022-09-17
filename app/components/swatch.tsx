type Props = {
  color: string;
};

export default function Swatch({ color }: Props) {
  return (
    <button
      className="rounded py-4 px-4"
      style={{ backgroundColor: color, pointerEvents: "none" }}
    ></button>
  );
}
