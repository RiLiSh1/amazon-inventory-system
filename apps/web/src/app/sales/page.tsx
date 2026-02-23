"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchSalesData, fetchDailySales } from "@/lib/api-client";
import type { T4sSalesData } from "@amazon-inventory/shared";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

const columns: Column<T4sSalesData>[] = [
  {
    key: "date",
    header: "日付",
    sortable: true,
    render: (row) => formatDate(row.date),
  },
  { key: "asin", header: "ASIN", className: "font-mono" },
  { key: "sku", header: "SKU", className: "font-mono" },
  {
    key: "quantity",
    header: "数量",
    sortable: true,
    className: "text-right",
    render: (row) => String(row.quantity),
  },
  {
    key: "amount",
    header: "金額",
    sortable: true,
    className: "text-right",
    render: (row) => formatCurrency(row.amount),
  },
];

export default function SalesPage() {
  const [startDate, setStartDate] = useState(daysAgo(6));
  const [endDate, setEndDate] = useState(daysAgo(0));
  const [salesData, setSalesData] = useState<T4sSalesData[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; amount: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadSales = fetchSalesData(startDate, endDate).then((raw) =>
      raw.map((s) => ({
        ...s,
        date: new Date(s.date),
        sellerId: "",
        marketplaceId: "",
        createdAt: new Date(s.date),
        updatedAt: new Date(s.date),
      })),
    );

    const loadDaily = fetchDailySales(startDate, endDate);

    Promise.all([loadSales, loadDaily])
      .then(([sales, daily]) => {
        setSalesData(sales);
        setDailyData(daily);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const totalAmount = useMemo(
    () => salesData.reduce((sum, s) => sum + s.amount, 0),
    [salesData],
  );

  return (
    <>
      <Header
        title="売上データ"
        description={`合計: ${formatCurrency(totalAmount)}`}
      />
      <div className="p-8 space-y-8">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-red-600">データの取得に失敗しました: {error}</p>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">日別売上</h2>
              <SalesBarChart data={dailyData} />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">売上明細</h2>
              <DataTable
                columns={columns}
                data={salesData}
                keyExtractor={(row) => row.id}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
