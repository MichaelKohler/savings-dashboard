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
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";

import { getAccounts } from "~/models/accounts.server";
import { getBalancesForCharts } from "~/models/balances.server";
import { requireUserId } from "~/session.server";
import { getGroups } from "~/models/groups.server";
import { getTypes } from "~/models/types.server";

export function meta(): ReturnType<MetaFunction> {
  return [
    {
      title: "Charts",
    },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId });
  const { balances, predictions } = await getBalancesForCharts({ userId });
  const groups = await getGroups({ userId });
  const types = await getTypes({ userId });
  return { accounts, balances, groups, types, predictions };
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
  // Not as dinstinctive anymore
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

export default function ChartsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="h-auto w-full">
      <h2 className="text-2xl">Total</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          <Line
            name="Total"
            type="monotoneX"
            dataKey="total"
            stroke={COLORS[0]}
          />
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Predictions</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.predictions}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatTick} />
          <Line name="1%" type="monotoneX" dataKey="1" stroke={COLORS[0]} />
          <Line name="3%" type="monotoneX" dataKey="3" stroke={COLORS[1]} />
          <Line name="5%" type="monotoneX" dataKey="5" stroke={COLORS[2]} />
          <Line name="7%" type="monotoneX" dataKey="7" stroke={COLORS[3]} />
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Account</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {data.accounts.map((account) => {
            return (
              <Line
                key={account.id}
                name={`${account.name}${account.group?.name ? ` (${account.group.name})` : ""}`}
                type="monotoneX"
                dataKey={`byAccount.${account.id}`}
                stroke={account.color}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
          <Legend />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Stacked</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {data.accounts.map((account) => {
            return (
              <Bar
                key={account.id}
                name={`${account.name}${account.group?.name ? ` (${account.group.name})` : ""}`}
                type="monotoneX"
                dataKey={`byAccount.${account.id}`}
                stackId="STACK_ALL"
                fill={account.color}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Group</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {data.groups.map((group, index) => {
            return (
              <Bar
                key={group.id}
                name={group.name}
                type="monotoneX"
                dataKey={`byGroup.${group.id}`}
                stackId="STACK_ALL"
                fill={COLORS[index % COLORS.length]}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-16 text-2xl">Per Type</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatTick} />
          {data.types.map((type, index) => {
            return (
              <Bar
                key={type.id}
                name={type.name}
                type="monotoneX"
                dataKey={`byType.${type.id}`}
                stackId="STACK_ALL"
                fill={COLORS[index % COLORS.length]}
              />
            );
          })}
          <Tooltip cursor={false} wrapperStyle={{ zIndex: 10 }} />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
