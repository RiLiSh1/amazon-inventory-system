"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SkuSalesRow {
  sku: string;
  title: string;
  totalAmount: number;
}

interface SalesBySkuChartProps {
  data: SkuSalesRow[];
}

export function SalesBySkuChart({ data }: SalesBySkuChartProps) {
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.title ? d.title.slice(0, 20) : d.sku,
    amount: d.totalAmount,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11 }}
          stroke="#9ca3af"
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "売上金額"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        />
        <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
