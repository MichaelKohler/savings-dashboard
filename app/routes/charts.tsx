import { useState } from "react";
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
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getAccounts } from "~/models/accounts.server";
import { getBalancesForCharts } from "~/models/balances.server";
import { requireUserId } from "~/session.server";

export function meta(): ReturnType<MetaFunction> {
  return {
    title: "Charts",
  };
}

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const accounts = await getAccounts({ userId });
  const balances = await getBalancesForCharts({ userId });
  return json({ accounts, balances });
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
                name={account.name}
                type="monotoneX"
                dataKey={account.id}
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
                name={account.name}
                type="monotoneX"
                dataKey={account.id}
                stackId="STACK_ALL"
                fill={account.color}
              />
            );
          })}
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </main>
  );
}
