import { cn } from "@/lib/utils";

const defaultColorMap: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  success: "bg-green-100 text-green-800",
  CLOSED: "bg-green-100 text-green-800",
  normal: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  low: "bg-red-100 text-red-800",
  running: "bg-yellow-100 text-yellow-800",
  RECEIVING: "bg-yellow-100 text-yellow-800",
  WORKING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  colorMap?: Record<string, string>;
}

export function StatusBadge({ status, label, colorMap }: StatusBadgeProps) {
  const colors = { ...defaultColorMap, ...colorMap };
  const colorClass = colors[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        status === "running" && "animate-pulse",
      )}
    >
      {label || status}
    </span>
  );
}
