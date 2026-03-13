"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Download, ChevronDown, DollarSign, ShoppingCart, Tag } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { KPICard } from "@/components/ui/kpi-card";
import { SalesBarChart } from "@/components/charts/sales-bar-chart";
import { SalesBySkuChart } from "@/components/charts/sales-by-sku-chart";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { fetchSalesData, fetchDailySales, fetchSalesBySku } from "@/lib/api-client";
import { exportToCsv } from "@/lib/csv-export";

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

const DETAIL_PAGE_SIZE = 20;

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
  const [detailPage, setDetailPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setDetailOpen(false);
    setSalesData([]);
    setDetailPage(1);

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

  const detailTotalPages = Math.max(1, Math.ceil(salesData.length / DETAIL_PAGE_SIZE));
  const paginatedDetail = salesData.slice(
    (detailPage - 1) * DETAIL_PAGE_SIZE,
    detailPage * DETAIL_PAGE_SIZE,
  );

  const handleExportSkuCsv = () => {
    exportToCsv(
      skuData,
      [
        { header: "SKU", accessor: "sku" },
        { header: "ASIN", accessor: "asin" },
        { header: "商品名", accessor: "title" },
        { header: "数量", accessor: "totalQuantity" },
        { header: "金額", accessor: "totalAmount" },
      ],
      "sales-by-sku",
    );
  };

  const handleExportDetailCsv = () => {
    exportToCsv(
      salesData,
      [
        { header: "日付", accessor: (row) => formatDate(row.date) },
        { header: "SKU", accessor: "sku" },
        { header: "ASIN", accessor: "asin" },
        { header: "数量", accessor: "quantity" },
        { header: "金額", accessor: "amount" },
      ],
      "sales-detail",
    );
  };

  return (
    <>
      <Header title="売上データ" description="期間別の売上分析" />
      <div className="p-4 sm:p-8 space-y-6">
        {/* Date Range Picker */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">開始日</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">終了日</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-6">
            {/* KPI Skeletons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[140px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Chart Skeletons */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[250px] w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[250px] w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">データの取得に失敗しました: {error}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KPICard
                title="合計売上金額"
                value={formatCurrency(totalAmount)}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KPICard
                title="合計販売数"
                value={`${formatNumber(totalQty)}個`}
                icon={<ShoppingCart className="h-4 w-4" />}
              />
              <KPICard
                title="SKU数"
                value={formatNumber(skuCount)}
                icon={<Tag className="h-4 w-4" />}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">日別売上推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesBarChart data={dailyData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SKU別売上（上位10）</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesBySkuChart data={skuData} />
                </CardContent>
              </Card>
            </div>

            {/* SKU Summary Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">SKU別集計</CardTitle>
                    <CardDescription>{skuCount}件のSKU</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportSkuCsv} disabled={skuData.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV出力
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>ASIN</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skuData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          データがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      skuData.map((row) => (
                        <TableRow key={row.sku}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">{row.sku}</TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">{row.asin}</TableCell>
                          <TableCell className="text-foreground">{row.title || "-"}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatNumber(row.totalQuantity)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.totalAmount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detail Table - lazy loaded */}
            <Card>
              <button
                type="button"
                onClick={() => (detailOpen ? setDetailOpen(false) : loadDetail())}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
              >
                <div>
                  <h2 className="text-base font-semibold text-foreground">売上明細</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">個別の売上レコードを表示</p>
                </div>
                <ChevronDown
                  className="h-5 w-5 text-muted-foreground transition-transform"
                  style={{ transform: detailOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {detailOpen && (
                <>
                  <Separator />
                  {detailLoading ? (
                    <CardContent className="p-6 space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="h-5 w-[100px]" />
                          <Skeleton className="h-5 w-[100px]" />
                          <Skeleton className="h-5 w-[100px]" />
                          <Skeleton className="h-5 w-[80px]" />
                          <Skeleton className="h-5 w-[100px]" />
                        </div>
                      ))}
                    </CardContent>
                  ) : (
                    <>
                      {/* Detail CSV export */}
                      {salesData.length > 0 && (
                        <div className="flex justify-end px-6 py-3">
                          <Button variant="outline" size="sm" onClick={handleExportDetailCsv}>
                            <Download className="mr-2 h-4 w-4" />
                            明細CSV出力
                          </Button>
                        </div>
                      )}

                      <div className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>日付</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>ASIN</TableHead>
                              <TableHead className="text-right">数量</TableHead>
                              <TableHead className="text-right">金額</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedDetail.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                  データがありません
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedDetail.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                                  <TableCell className="font-mono text-xs whitespace-nowrap">{row.sku}</TableCell>
                                  <TableCell className="font-mono text-xs whitespace-nowrap">{row.asin}</TableCell>
                                  <TableCell className="text-right whitespace-nowrap">{formatNumber(row.quantity)}</TableCell>
                                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.amount)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Detail Pagination */}
                      {salesData.length > DETAIL_PAGE_SIZE && (
                        <div className="flex items-center justify-between border-t border-border px-6 py-4">
                          <p className="text-sm text-muted-foreground">
                            {salesData.length}件中 {(detailPage - 1) * DETAIL_PAGE_SIZE + 1}〜{Math.min(detailPage * DETAIL_PAGE_SIZE, salesData.length)}件
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                              disabled={detailPage === 1}
                            >
                              前へ
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {detailPage} / {detailTotalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetailPage((p) => Math.min(detailTotalPages, p + 1))}
                              disabled={detailPage === detailTotalPages}
                            >
                              次へ
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
