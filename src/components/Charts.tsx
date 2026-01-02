import { useState } from "react";
import type { LegendPayload } from "recharts/types/component/DefaultLegendContent";
import {
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { Group } from "~/models/groups.server";
import type { Type } from "~/models/types.server";
import type { ChartDataEntry, PredictionEntry } from "~/models/balances.server";

// Type for Account with group relation
interface AccountWithGroup {
  id: string;
  name: string;
  color: string;
  group?: {
    id: string;
    name: string;
  } | null;
}

interface ChartsProps {
  accounts: AccountWithGroup[];
  balances: ChartDataEntry[];
  groups: Group[];
  types: Type[];
  predictions: PredictionEntry[];
}

const COLORS = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600",
  // Does not match color schema, but okay if needed
  "#488f31",
  "#75a760",
  "#9fc08f",
  "#c8d8bf",
  "#f1c6c6",
  "#ec9c9d",
  "#e27076",
  "#de425b",
  // Not as distinctive anymore
  "#004c6d",
  "#255e7e",
  "#3d708f",
  "#5383a1",
  "#6996b3",
  "#7faac6",
  "#94bed9",
  "#abd2ec",
  "#c1e7ff",
];

function formatTick(value: string) {
  const parsedValue = parseInt(value);
  const inK = parsedValue / 1000;
  return inK >= 1 ? `${inK}k` : value;
}

export default function Charts({
  accounts,
  balances,
  groups,
  types,
  predictions,
}: ChartsProps) {
  const [hiddenPredictions, setHiddenPredictions] = useState<string[]>([]);
  const [hiddenAccounts, setHiddenAccounts] = useState<string[]>([]);
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);

  const handlePredictionsLegendClick = (e: LegendPayload) => {
    const { dataKey } = e;
    if (typeof dataKey !== "string") return;
    setHiddenPredictions((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey]
    );
  };

  const handleTypesLegendClick = (e: LegendPayload) => {
    const { dataKey } = e;
    if (typeof dataKey !== "string") return;
    setHiddenTypes((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey]
    );
  };

  const handleGroupsLegendClick = (e: LegendPayload) => {
    const { dataKey } = e;
    if (typeof dataKey !== "string") return;
    setHiddenGroups((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey]
    );
  };

  const handleAccountsLegendClick = (e: LegendPayload) => {
    const { dataKey } = e;
    if (typeof dataKey !== "string") return;
    setHiddenAccounts((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey]
    );
  };

  return (
    <main className="h-auto w-full">
      <h2 className="text-2xl">Total</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          <Line
            name="Total"
            type="monotoneX"
            dataKey="total"
            stroke={COLORS[0]}
          />
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Predictions</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={predictions}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatTick} />
          <Line
            name="1%"
            type="monotoneX"
            dataKey="1"
            stroke={COLORS[0]}
            hide={hiddenPredictions.includes("1")}
          />
          <Line
            name="3%"
            type="monotoneX"
            dataKey="3"
            stroke={COLORS[1]}
            hide={hiddenPredictions.includes("3")}
          />
          <Line
            name="5%"
            type="monotoneX"
            dataKey="5"
            stroke={COLORS[2]}
            hide={hiddenPredictions.includes("5")}
          />
          <Line
            name="7%"
            type="monotoneX"
            dataKey="7"
            stroke={COLORS[3]}
            hide={hiddenPredictions.includes("7")}
          />
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
          <Legend onClick={handlePredictionsLegendClick} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Account</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {accounts.map((account) => {
            const dataKey = `byAccount.${account.id}`;
            return (
              <Line
                key={account.id}
                name={`${account.name}${account.group?.name ? ` (${account.group.name})` : ""}`}
                type="monotoneX"
                dataKey={dataKey}
                stroke={account.color}
                hide={hiddenAccounts.includes(dataKey)}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
          <Legend onClick={handleAccountsLegendClick} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Stacked</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {accounts.map((account) => {
            const dataKey = `byAccount.${account.id}`;
            return (
              <Bar
                key={account.id}
                name={`${account.name}${account.group?.name ? ` (${account.group.name})` : ""}`}
                type="monotoneX"
                dataKey={dataKey}
                stackId="STACK_ALL"
                fill={account.color}
                hide={hiddenAccounts.includes(dataKey)}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
          <Legend onClick={handleAccountsLegendClick} />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Group</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {groups.map((group, index) => {
            const dataKey = `byGroup.${group.id}`;
            return (
              <Bar
                key={group.id}
                name={group.name}
                type="monotoneX"
                dataKey={dataKey}
                stackId="STACK_ALL"
                fill={COLORS[index % COLORS.length]}
                hide={hiddenGroups.includes(dataKey)}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
          <Legend onClick={handleGroupsLegendClick} />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Type</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {types.map((type, index) => {
            const dataKey = `byType.${type.id}`;
            return (
              <Bar
                key={type.id}
                name={type.name}
                type="monotoneX"
                dataKey={dataKey}
                stackId="STACK_ALL"
                fill={COLORS[index % COLORS.length]}
                hide={hiddenTypes.includes(dataKey)}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 20 }} />
          <Legend onClick={handleTypesLegendClick} />
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
