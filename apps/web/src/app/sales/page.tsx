"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { mockSalesData, mockDailySales } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
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

  const filteredSales = useMemo(() => {
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
  }, [startDate, endDate]);

  const filteredDaily = useMemo(() => {
    return mockDailySales.filter((d) => d.date >= startDate && d.date <= endDate);
  }, [startDate, endDate]);

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.amount, 0);

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

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">日別売上</h2>
          <SalesBarChart data={filteredDaily} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">売上明細</h2>
          <DataTable
            columns={columns}
            data={filteredSales}
            keyExtractor={(row) => row.id}
          />
        </div>
      </div>
    </>
  );
}
