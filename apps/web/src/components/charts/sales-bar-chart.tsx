"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatShortDate, formatCurrency } from "@/lib/utils";

interface SalesBarChartProps {
  data: { date: string; amount: number; quantity: number }[];
}

export function SalesBarChart({ data }: SalesBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis
          yAxisId="amount"
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis
          yAxisId="quantity"
          orientation="right"
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "amount" ? formatCurrency(value) : `${value}個`,
            name === "amount" ? "売上金額" : "販売数",
          ]}
          labelFormatter={(label: string) => formatShortDate(label)}
        />
        <Legend
          formatter={(value: string) => (value === "amount" ? "売上金額" : "販売数")}
        />
        <Bar yAxisId="amount" dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="quantity" dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
