"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SalesLineChart } from "@/components/charts/sales-line-chart";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { fetchDashboardSummary, withFallback } from "@/lib/api-client";
import { mockDashboardKPIs, mockDailySales, mockLowStockItems } from "@/lib/mock-data";

interface DashboardData {
  kpis: { totalProducts: number; totalInventory: number; todaySales: number; lowStockCount: number };
  chartData: { date: string; amount: number; quantity: number }[];
  lowStockItems: Array<{
    id: string;
    quantity: number;
    availableQuantity: number;
    reorderPoint: number;
    product: { sku: string; title: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withFallback(
      () => fetchDashboardSummary(),
      () => ({
        kpis: mockDashboardKPIs,
        chartData: mockDailySales,
        lowStockItems: mockLowStockItems.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          availableQuantity: i.availableQuantity,
          reorderPoint: i.reorderPoint,
          product: { sku: i.product.sku, title: i.product.title },
        })),
      }),
    ).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <>
        <Header title="ダッシュボード" description="在庫状況と売上の概要" />
        <div className="flex items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="ダッシュボード" description="在庫状況と売上の概要" />
      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="有効商品数"
            value={data.kpis.totalProducts}
            subtitle="アクティブな商品"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            }
          />
          <KPICard
            title="総在庫数"
            value={formatNumber(data.kpis.totalInventory)}
            subtitle="全倉庫合計"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 17.25 6.43 14.25m11.142 0-5.572 3-5.571-3m0 0L2.25 16.5 12 21.75l9.75-5.25-4.179-2.25" />
              </svg>
            }
          />
          <KPICard
            title="本日の売上"
            value={formatCurrency(data.kpis.todaySales)}
            subtitle="前日比で推移中"
            trend="up"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            }
          />
          <KPICard
            title="在庫不足"
            value={`${data.kpis.lowStockCount}件`}
            subtitle="発注点以下の商品"
            trend="down"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            }
          />
        </div>

        {/* Sales Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">売上推移（過去30日間）</h2>
          <SalesLineChart data={data.chartData} />
        </div>

        {/* Low Stock Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">在庫不足アイテム</h2>
          {data.lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-500">在庫不足の商品はありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">商品名</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">在庫数</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">利用可能</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">発注点</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.lowStockItems.map((item) => (
                    <tr key={item.id} className="bg-red-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-700">{item.product.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.product.title}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">{item.availableQuantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">{item.reorderPoint}</td>
                      <td className="px-4 py-3"><StatusBadge status="low" label="在庫不足" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
