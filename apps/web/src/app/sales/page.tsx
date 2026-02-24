"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable, type Column } from "@/components/ui/data-table";
import { KPICard } from "@/components/ui/kpi-card";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { SalesBySkuChart } from "@/components/charts/sales-by-sku-chart";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { fetchSalesData, fetchDailySales, fetchSalesBySku } from "@/lib/api-client";

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

interface SkuSummary {
  sku: string;
  asin: string;
  title: string;
  totalAmount: number;
  totalQuantity: number;
}

const detailColumns: Column<SalesRow>[] = [
  {
    key: "date",
    header: "日付",
    sortable: true,
    className: "whitespace-nowrap",
    render: (row) => formatDate(row.date),
  },
  { key: "sku", header: "SKU", className: "font-mono text-xs whitespace-nowrap" },
  { key: "asin", header: "ASIN", className: "font-mono text-xs whitespace-nowrap" },
  {
    key: "quantity",
    header: "数量",
    sortable: true,
    className: "text-right whitespace-nowrap",
    render: (row) => formatNumber(row.quantity),
  },
  {
    key: "amount",
    header: "金額",
    sortable: true,
    className: "text-right whitespace-nowrap",
    render: (row) => formatCurrency(row.amount),
  },
];

const skuColumns: Column<SkuSummary>[] = [
  { key: "sku", header: "SKU", className: "font-mono text-xs whitespace-nowrap" },
  { key: "asin", header: "ASIN", className: "font-mono text-xs whitespace-nowrap" },
  {
    key: "title",
    header: "商品名",
    render: (row) => <span>{row.title || "-"}</span>,
  },
  {
    key: "totalQuantity",
    header: "数量",
    sortable: true,
    className: "text-right whitespace-nowrap",
    render: (row) => formatNumber(row.totalQuantity),
  },
  {
    key: "totalAmount",
    header: "金額",
    sortable: true,
    className: "text-right whitespace-nowrap",
    render: (row) => formatCurrency(row.totalAmount),
  },
];

export default function SalesPage() {
  const [startDate, setStartDate] = useState(daysAgo(6));
  const [endDate, setEndDate] = useState(daysAgo(0));
  const [dailyData, setDailyData] = useState<{ date: string; amount: number; quantity: number }[]>([]);
  const [skuData, setSkuData] = useState<SkuSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setDetailOpen(false);
    setSalesData([]);

    Promise.all([fetchDailySales(startDate, endDate), fetchSalesBySku(startDate, endDate)])
      .then(([daily, bySku]) => {
        setDailyData(daily);
        setSkuData(bySku);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const loadDetail = useCallback(() => {
    if (salesData.length > 0) {
      setDetailOpen(true);
      return;
    }
    setDetailLoading(true);
    setDetailOpen(true);
    fetchSalesData(startDate, endDate)
      .then((raw) =>
        setSalesData(
          raw.map((s) => ({
            id: s.id,
            date: new Date(s.date),
            asin: s.asin,
            sku: s.sku,
            quantity: s.quantity,
            amount: s.amount,
          })),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setDetailLoading(false));
  }, [startDate, endDate, salesData.length]);

  const totalAmount = useMemo(
    () => skuData.reduce((sum, s) => sum + s.totalAmount, 0),
    [skuData],
  );
  const totalQty = useMemo(
    () => skuData.reduce((sum, s) => sum + s.totalQuantity, 0),
    [skuData],
  );
  const skuCount = skuData.length;

  return (
    <>
      <Header title="売上データ" description="期間別の売上分析" />
      <div className="p-8 space-y-6">
        {/* Toolbar */}
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4">
            <p className="text-sm text-red-700">データの取得に失敗しました: {error}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KPICard title="合計売上金額" value={formatCurrency(totalAmount)} />
              <KPICard title="合計販売数" value={`${formatNumber(totalQty)}個`} />
              <KPICard title="SKU数" value={formatNumber(skuCount)} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-900">日別売上推移</h2>
                <SalesBarChart data={dailyData} />
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-900">SKU別売上（上位10）</h2>
                <SalesBySkuChart data={skuData} />
              </div>
            </div>

            {/* SKU Summary Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">SKU別集計</h2>
                <p className="mt-0.5 text-xs text-gray-500">{skuCount}件のSKU</p>
              </div>
              <DataTable
                columns={skuColumns}
                data={skuData}
                keyExtractor={(row) => row.sku}
                borderless
              />
            </div>

            {/* Detail Table - lazy loaded */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => (detailOpen ? setDetailOpen(false) : loadDetail())}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900">売上明細</h2>
                  <p className="mt-0.5 text-xs text-gray-500">個別の売上レコードを表示</p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 transition-transform"
                  style={{ transform: detailOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {detailOpen && (
                <>
                  <div className="border-t border-gray-200" />
                  {detailLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                  ) : (
                    <DataTable
                      columns={detailColumns}
                      data={salesData}
                      keyExtractor={(row) => row.id}
                      borderless
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
