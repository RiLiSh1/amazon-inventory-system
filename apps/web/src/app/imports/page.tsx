"use client";

import { useEffect, useState } from "react";
import { Database, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
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
import { IMPORT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { fetchImportLogs } from "@/lib/api-client";
import type { T4sImportLog } from "@amazon-inventory/shared";

function ImportStatusBadge({ status }: { status: string }) {
  const label = IMPORT_STATUS_LABELS[status] || status;

  switch (status) {
    case "running":
      return (
        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          {label}
        </Badge>
      );
    case "success":
      return (
        <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {label}
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          {label}
        </Badge>
      );
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function ImportsPage() {
  const [logs, setLogs] = useState<T4sImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImportLogs()
      .then((raw) => {
        const mapped = raw.map((l) => ({
          ...l,
          status: l.status as T4sImportLog["status"],
          startedAt: new Date(l.startedAt),
          completedAt: l.completedAt ? new Date(l.completedAt) : null,
          createdAt: new Date(l.startedAt),
        }));
        const sorted = mapped.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
        setLogs(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header
        title="インポート履歴"
        description="Tool4Seller APIからのデータ取込ログ"
      />
      <div className="p-4 sm:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">取込ログ一覧</CardTitle>
            </div>
            <CardDescription>
              全{logs.length}件のインポート履歴
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
            ) : logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                インポート履歴がありません
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>エンドポイント</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">件数</TableHead>
                    <TableHead>エラーメッセージ</TableHead>
                    <TableHead>開始日時</TableHead>
                    <TableHead>完了日時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.endpoint}
                      </TableCell>
                      <TableCell>
                        <ImportStatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(log.recordsCount)}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm">
                        {log.errorMessage ? (
                          <span
                            className="text-destructive"
                            title={log.errorMessage}
                          >
                            {log.errorMessage.length > 40
                              ? log.errorMessage.slice(0, 40) + "..."
                              : log.errorMessage}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">---</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(log.startedAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.completedAt
                          ? formatDateTime(log.completedAt)
                          : <span className="text-muted-foreground">---</span>}
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
