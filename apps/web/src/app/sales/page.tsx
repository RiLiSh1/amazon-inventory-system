"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { mockSalesData, mockDailySales } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchSalesData, fetchDailySales, withFallback } from "@/lib/api-client";
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
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(daysAgo(0));
  const [salesData, setSalesData] = useState<T4sSalesData[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; amount: number; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const loadSales = withFallback<T4sSalesData[]>(
      async () => {
        const raw = await fetchSalesData(startDate, endDate);
        return raw.map((s) => ({
          ...s,
          date: new Date(s.date),
          sellerId: "",
          marketplaceId: "",
          createdAt: new Date(s.date),
          updatedAt: new Date(s.date),
        }));
      },
      () => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return mockSalesData
          .filter((s) => {
            const d = new Date(s.date);
            return d >= start && d <= end;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
    );

    const loadDaily = withFallback<{ date: string; amount: number; quantity: number }[]>(
      () => fetchDailySales(startDate, endDate),
      () => mockDailySales.filter((d) => d.date >= startDate && d.date <= endDate),
    );

    Promise.all([loadSales, loadDaily]).then(([sales, daily]) => {
      setSalesData(sales);
      setDailyData(daily);
      setLoading(false);
    });
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
