import type { TooltipContentProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

export default function ChartTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps<ValueType, NameType>>) {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum, entry) => {
    return sum + (typeof entry.value === "number" ? entry.value : 0);
  }, 0);

  return (
    <div className="rounded border border-gray-300 bg-white p-2 shadow-md">
      {label ? <p className="mb-1 font-semibold">{label}</p> : null}
      <p className="mb-1 border-b border-gray-300 pb-1 font-semibold">
        Total: {total}
      </p>
      <ul>
        {payload.map((entry, index) => (
          <li
            key={String(entry.dataKey ?? entry.name ?? index)}
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
