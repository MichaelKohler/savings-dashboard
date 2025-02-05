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
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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
  const balances = await getBalancesForCharts({ userId });
  const groups = await getGroups({ userId });
  const types = await getTypes({ userId });
  return json({ accounts, balances, groups, types });
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

export default function ChartsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="h-auto w-full">
      <h2 className="text-2xl">Total</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis />
          <Line
            name="Total"
            type="monotoneX"
            dataKey="total"
            stroke="#0099CC"
          />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-8 text-2xl">Total (not zero-based)</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis type="number" domain={["dataMin - 1000", "dataMax + 1000"]} />
          <Line
            name="Total"
            type="monotoneX"
            dataKey="total"
            stroke="#0099CC"
          />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-8 text-2xl">Per Account</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <LineChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis />
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
          <Tooltip />
          <Legend />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="mt-8 text-2xl">Stacked</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis />
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
          <Tooltip />
          <Legend />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-8 text-2xl">Per Group</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis />
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
          <Tooltip />
          <Legend />
        </BarChart>
      </ResponsiveContainer>

      <h2 className="mt-8 text-2xl">Per Type</h2>
      <ResponsiveContainer width={"100%"} height={500} className="mt-8">
        <BarChart width={500} height={300} data={data.balances}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="date" />
          <YAxis />
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
          <Tooltip />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
