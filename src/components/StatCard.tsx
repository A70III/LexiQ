import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = "#1d1d1f" }: StatCardProps) {
  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100/80 flex flex-col gap-1 card-hover">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {icon && (
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold tracking-tight" style={{ color }}>
        {value}
      </span>
      {subtitle && <span className="text-xs text-gray-400 mt-0.5">{subtitle}</span>}
    </div>
  );
}
