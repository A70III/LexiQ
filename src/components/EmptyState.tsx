import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {icon && <span className="text-4xl text-gray-300">{icon}</span>}
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 text-center max-w-xs leading-relaxed">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
