export type ImportStatus = "running" | "success" | "failed";

export interface T4sImportLog {
  id: string;
  endpoint: string;
  status: ImportStatus;
  recordsCount: number;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}
