"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, Package, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { fetchInventories } from "@/lib/api-client";
import { exportToCsv } from "@/lib/csv-export";

interface InventoryItem {
  id: string;
  productId: string;
  asin: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  product: { sku: string; title: string; price: number | null };
}

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const [filter, setFilter] = useState("all");
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInventories()
      .then((data) => setInventories(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "low") return inventories.filter((i) => i.availableQuantity <= i.reorderPoint);
    if (filter === "normal") return inventories.filter((i) => i.availableQuantity > i.reorderPoint);
    return inventories;
  }, [filter, inventories]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowCount = inventories.filter((i) => i.availableQuantity <= i.reorderPoint).length;

  const handleExportCsv = () => {
    exportToCsv(
      filtered,
      [
        { header: "商品名", accessor: (row) => row.product.title },
        { header: "SKU", accessor: (row) => row.product.sku },
        { header: "ASIN", accessor: "asin" },
        { header: "総在庫", accessor: "quantity" },
        { header: "出荷可能", accessor: "availableQuantity" },
        { header: "予約済", accessor: "reservedQuantity" },
        { header: "発注点", accessor: "reorderPoint" },
        { header: "状態", accessor: (row) => row.availableQuantity <= row.reorderPoint ? "在庫不足" : "正常" },
      ],
      "inventory",
    );
  };

  return (
    <>
      <Header
        title="在庫管理"
        description={`全${inventories.length}件 / 在庫不足: ${lowCount}件`}
      />
      <div className="p-4 sm:p-8 space-y-6">
        {/* Toolbar */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">
                  在庫ステータス
                </label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="low">在庫不足</SelectItem>
                    <SelectItem value="normal">正常</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || filtered.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                CSV出力
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary badges */}
        {!loading && !error && (
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">全商品: {inventories.length}件</span>
            </div>
            {lowCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">在庫不足: {lowCount}件</span>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-5 w-[80px]" />
                  <Skeleton className="h-5 w-[70px]" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">データの取得に失敗しました: {error}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">在庫一覧</CardTitle>
              <CardDescription>
                {filtered.length}件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, filtered.length)}件を表示
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品名</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>ASIN</TableHead>
                    <TableHead className="text-right">総在庫</TableHead>
                    <TableHead className="text-right">出荷可能</TableHead>
                    <TableHead className="text-right">予約済</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        データがありません
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((row) => {
                      const isLow = row.availableQuantity <= row.reorderPoint;
                      return (
                        <TableRow
                          key={row.id}
                          className={isLow ? "bg-destructive/5 hover:bg-destructive/10" : undefined}
                        >
                          <TableCell className="font-medium text-foreground max-w-[300px] truncate">
                            {row.product.title}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {row.product.sku}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            <a
                              href={`https://www.amazon.co.jp/dp/${row.asin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {row.asin}
                            </a>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatNumber(row.quantity)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatNumber(row.availableQuantity)}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {formatNumber(row.reservedQuantity)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isLow ? "destructive" : "default"}>
                              {isLow ? "在庫不足" : "正常"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  {filtered.length}件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, filtered.length)}件
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    前へ
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
