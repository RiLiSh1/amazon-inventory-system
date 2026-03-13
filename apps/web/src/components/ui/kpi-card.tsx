import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, trend, icon }: KPICardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p
          className={cn(
            "mt-1 text-sm",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600",
            (!trend || trend === "neutral") && "text-gray-500",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
