"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockProducts } from "@/lib/mock-data";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { fetchProducts, withFallback } from "@/lib/api-client";
import type { Product } from "@amazon-inventory/shared";

const columns: Column<Product>[] = [
  { key: "asin", header: "ASIN", sortable: true, className: "font-mono" },
  { key: "sku", header: "SKU", sortable: true, className: "font-mono" },
  {
    key: "title",
    header: "商品名",
    sortable: true,
    render: (row) => (
      <span className="block max-w-xs truncate" title={row.title}>
        {row.title}
      </span>
    ),
  },
  { key: "brand", header: "ブランド", sortable: true },
  { key: "category", header: "カテゴリー", sortable: true },
  {
    key: "price",
    header: "価格",
    sortable: true,
    className: "text-right",
    render: (row) => (row.price != null ? formatCurrency(row.price) : "---"),
  },
  {
    key: "status",
    header: "ステータス",
    render: (row) => (
      <StatusBadge
        status={row.status}
        label={PRODUCT_STATUS_LABELS[row.status] || row.status}
      />
    ),
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withFallback<Product[]>(
      async () => {
        const raw = await fetchProducts();
        return raw.map((p) => ({
          ...p,
          imageUrl: null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      },
      () => mockProducts,
    ).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.asin.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
    );
  }, [search, products]);

  return (
    <>
      <Header title="商品管理" description={`全${products.length}件の商品`} />
      <div className="p-8 space-y-6">
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ASIN、SKU、商品名で検索..."
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>
    </>
  );
}
