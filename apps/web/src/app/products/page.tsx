"use client";

import { useState, useMemo, useEffect } from "react";
import { Package, ShoppingBag, XCircle, Search, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { fetchProducts } from "@/lib/api-client";
import { exportToCsv } from "@/lib/csv-export";

interface ProductRow {
  id: string;
  asin: string;
  sku: string;
  title: string;
  brand: string | null;
  price: number | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "active", label: "販売中" },
  { value: "inactive", label: "停止中" },
];

function ProductsSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((raw) =>
        setProducts(
          raw.map((p) => ({
            id: p.id,
            asin: p.asin,
            sku: p.sku,
            title: p.title,
            brand: p.brand,
            price: p.price,
            status: p.status,
          })),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.asin.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [search, statusFilter, products]);

  const activeCount = products.filter((p) => p.status === "active").length;
  const inactiveCount = products.length - activeCount;

  const handleExport = () => {
    if (!filtered.length) return;
    exportToCsv(
      filtered,
      [
        { header: "ASIN", accessor: "asin" },
        { header: "SKU", accessor: "sku" },
        { header: "商品名", accessor: "title" },
        { header: "ブランド", accessor: (row) => row.brand ?? "" },
        { header: "価格", accessor: (row) => row.price ?? "" },
        { header: "ステータス", accessor: (row) => (row.status === "active" ? "販売中" : "停止中") },
      ],
      "products",
    );
  };

  return (
    <>
      <Header title="商品管理" description="登録済み商品の一覧と検索" />

      {loading ? (
        <ProductsSkeleton />
      ) : error ? (
        <div className="p-8">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">データの取得に失敗しました: {error}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-8 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard
              title="全商品数"
              value={products.length}
              icon={<Package className="h-5 w-5" />}
            />
            <KPICard
              title="販売中"
              value={activeCount}
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <KPICard
              title="停止中"
              value={inactiveCount}
              icon={<XCircle className="h-5 w-5" />}
            />
          </div>

          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ASIN、SKU、商品名、ブランドで検索..."
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filtered.length}件表示
                  </span>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV出力
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  該当する商品が見つかりませんでした。
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>ASIN</TableHead>
                      <TableHead className="text-right">価格</TableHead>
                      <TableHead>状態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{row.title}</span>
                            {row.brand && (
                              <span className="block text-xs text-muted-foreground mt-0.5">
                                {row.brand}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {row.sku}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          <a
                            href={`https://www.amazon.co.jp/dp/${row.asin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {row.asin}
                          </a>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {row.price != null ? (
                            <span>{formatCurrency(row.price)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.status === "active" ? "default" : "secondary"}>
                            {row.status === "active" ? "販売中" : "停止中"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
