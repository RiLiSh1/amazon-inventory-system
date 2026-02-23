"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { fetchSalesData, fetchDailySales } from "@/lib/api-client";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

interface SalesRow {
  id: string;
  date: Date;
  asin: string;
  sku: string;
  quantity: number;
  amount: number;
}

const columns: Column<SalesRow>[] = [
  {
    key: "date",
    header: "日付",
    sortable: true,
    render: (row) => formatDate(row.date),
  },
  { key: "sku", header: "SKU", className: "font-mono text-sm" },
  { key: "asin", header: "ASIN", className: "font-mono text-sm" },
  {
    key: "quantity",
    header: "数量",
    sortable: true,
    className: "text-right",
    render: (row) => formatNumber(row.quantity),
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
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; amount: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadSales = fetchSalesData(startDate, endDate).then((raw) =>
      raw.map((s) => ({
        id: s.id,
        date: new Date(s.date),
        asin: s.asin,
        sku: s.sku,
        quantity: s.quantity,
        amount: s.amount,
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
  const totalQty = useMemo(
    () => salesData.reduce((sum, s) => sum + s.quantity, 0),
    [salesData],
  );

  return (
    <>
      <Header
        title="売上データ"
        description={`合計: ${formatCurrency(totalAmount)} / ${formatNumber(totalQty)}個`}
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
