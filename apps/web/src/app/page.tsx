"use client";

import { useEffect, useState } from "react";
import { Package, Layers, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesLineChart } from "@/components/charts/sales-line-chart";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { fetchDashboardSummary } from "@/lib/api-client";
import { exportToCsv } from "@/lib/csv-export";

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

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardSummary()
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExportLowStock = () => {
    if (!data?.lowStockItems.length) return;
    exportToCsv(
      data.lowStockItems,
      [
        { header: "SKU", accessor: (row) => row.product.sku },
        { header: "商品名", accessor: (row) => row.product.title },
        { header: "在庫数", accessor: "quantity" },
        { header: "利用可能数", accessor: "availableQuantity" },
        { header: "発注点", accessor: "reorderPoint" },
      ],
      "low_stock_items",
    );
  };

  if (loading) {
    return (
      <>
        <Header title="ダッシュボード" description="在庫状況と売上の概要" />
        <DashboardSkeleton />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header title="ダッシュボード" description="在庫状況と売上の概要" />
        <div className="p-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">データの取得に失敗しました: {error}</p>
            </CardContent>
          </Card>
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
            icon={<Package className="h-5 w-5" />}
          />
          <KPICard
            title="総在庫数"
            value={formatNumber(data.kpis.totalInventory)}
            subtitle="全倉庫合計"
            icon={<Layers className="h-5 w-5" />}
          />
          <KPICard
            title="本日の売上"
            value={formatCurrency(data.kpis.todaySales)}
            subtitle="前日比で推移中"
            trend="up"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="在庫不足"
            value={`${data.kpis.lowStockCount}件`}
            subtitle="発注点以下の商品"
            trend="down"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">売上推移（過去30日間）</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesLineChart data={data.chartData} />
          </CardContent>
        </Card>

        {/* Low Stock Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">在庫不足アイテム</CardTitle>
            {data.lowStockItems.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportLowStock}>
                <Download className="mr-2 h-4 w-4" />
                CSV出力
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {data.lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">在庫不足の商品はありません。</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead className="text-right">在庫数</TableHead>
                    <TableHead className="text-right">利用可能</TableHead>
                    <TableHead className="text-right">発注点</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                      <TableCell>{item.product.title}</TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">{item.availableQuantity}</TableCell>
                      <TableCell className="text-right">{item.reorderPoint}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">在庫不足</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
