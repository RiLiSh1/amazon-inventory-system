/**
 * CSV export utility
 * Converts array of objects to CSV and triggers download
 */

type CsvValue = string | number | boolean | null | undefined;

interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => CsvValue);
}

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string,
): void {
  const headerRow = columns.map((c) => escapeCell(c.header)).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
        return escapeCell(value as CsvValue);
      })
      .join(","),
  );

  // BOM for Excel Japanese support
  const bom = "\uFEFF";
  const csvContent = bom + [headerRow, ...dataRows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
