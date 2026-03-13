"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Package, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { fetchShipments, fetchShipmentItems } from "@/lib/api-client";
import type { T4sInboundShipment, T4sInboundShipmentItem } from "@amazon-inventory/shared";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  WORKING: "default",
  SHIPPED: "secondary",
  RECEIVING: "outline",
  CLOSED: "destructive",
};

function ShipmentStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-sm text-muted-foreground">---</span>;
  const variant = STATUS_VARIANT[status] ?? "outline";
  const label = SHIPMENT_STATUS_LABELS[status] || status;
  return <Badge variant={variant}>{label}</Badge>;
}

function ShipmentItemsPanel({ shipmentId }: { shipmentId: string }) {
  const [items, setItems] = useState<T4sInboundShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipmentItems(shipmentId)
      .then((raw) => {
        setItems(
          raw.map((i) => ({
            ...i,
            createdAt: new Date(),
            updatedAt: new Date(),
          })) as T4sInboundShipmentItem[],
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">明細データなし</p>
    );
  }

  return (
    <div className="bg-muted/30 px-4 py-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">SKU</TableHead>
            <TableHead className="text-xs">Network SKU</TableHead>
            <TableHead className="text-right text-xs">出荷数量</TableHead>
            <TableHead className="text-right text-xs">受領数量</TableHead>
            <TableHead className="text-right text-xs">ケース数</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {item.networkSku || "---"}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatNumber(item.qtyShipped)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatNumber(item.qtyReceived)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatNumber(item.qtyInCase)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<T4sInboundShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments()
      .then((raw) => {
        setShipments(
          raw.map((s) => ({
            ...s,
            sellerId: "",
            estimatedTime: s.estimatedTime ? new Date(s.estimatedTime) : null,
            updateTime: s.updateTime ? new Date(s.updateTime) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <Header
        title="納品プラン"
        description={`全${shipments.length}件の納品プラン`}
      />
      <div className="p-4 sm:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">納品プラン一覧</CardTitle>
            </div>
            <CardDescription>
              行をクリックで明細を展開できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>データの取得に失敗しました: {error}</span>
              </div>
            ) : shipments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                納品プランがありません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>納品プラン名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>FC</TableHead>
                    <TableHead>到着予定日</TableHead>
                    <TableHead>最終更新</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => {
                    const isExpanded = expandedId === shipment.id;
                    return (
                      <Fragment key={shipment.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => toggleExpand(shipment.id)}
                        >
                          <TableCell className="w-10">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono">
                            {shipment.shipmentId}
                          </TableCell>
                          <TableCell>
                            {shipment.shipmentName || "---"}
                          </TableCell>
                          <TableCell>
                            <ShipmentStatusBadge status={shipment.shipmentStatus} />
                          </TableCell>
                          <TableCell>
                            {shipment.centerId || "---"}
                          </TableCell>
                          <TableCell>
                            {shipment.estimatedTime
                              ? formatDate(shipment.estimatedTime)
                              : "---"}
                          </TableCell>
                          <TableCell>
                            {shipment.updateTime
                              ? formatDateTime(shipment.updateTime)
                              : "---"}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={7} className="p-0">
                              <ShipmentItemsPanel shipmentId={shipment.shipmentId} />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
