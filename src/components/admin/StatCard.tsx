import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon: LucideIcon;
}

export function StatCard({ title, value, trend, isPositive = true, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-[#252526] p-4 font-sans flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-[#f97316]" />
        <h3 className="text-[13px] font-semibold text-[#cccccc]">{title}</h3>
      </div>
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-light text-white">{value}</h2>
        {trend && (
          <span className={`text-[11px] font-medium ${isPositive ? 'text-[#84c87e]' : 'text-[#f87c7c]'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
